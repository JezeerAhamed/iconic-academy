import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serverEnv } from '@/lib/env';
import { sanitiseEmail, sanitiseInput } from '@/lib/sanitise';
import { withSecurity } from '@/lib/with-security';

export const dynamic = 'force-dynamic';

let stripeInstance: Stripe | null = null;

function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(serverEnv.stripeSecretKey, {
      apiVersion: '2023-10-16' as never,
    });
  }

  return stripeInstance;
}

export const POST = withSecurity(async (request: NextRequest) => {
  const stripe = getStripe();
  const body = (await request.json()) as {
    priceId?: string;
    userId?: string;
    userEmail?: string;
  };

  const priceId = sanitiseInput(body.priceId || '', { maxLength: 200, stripHtml: false });
  const userId = sanitiseInput(body.userId || '', { maxLength: 128, stripHtml: false });
  const userEmail = sanitiseEmail(body.userEmail || '');

  if (!priceId || !userId || !userEmail) {
    return NextResponse.json(
      { error: 'Missing required fields: priceId, userId, userEmail' },
      { status: 400 }
    );
  }

  const subDocRef = adminDb.collection('subscriptions').doc(userId);
  const subDoc = await subDocRef.get();
  let customerId = subDoc.exists ? sanitiseInput(String(subDoc.data()?.stripeCustomerId || ''), { maxLength: 128 }) : '';

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { firebaseUserId: userId },
    });
    customerId = customer.id;
    await subDocRef.set({ stripeCustomerId: customerId }, { merge: true });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${serverEnv.appUrl}/dashboard/billing?success=true`,
    cancel_url: `${serverEnv.appUrl}/pricing?cancelled=true`,
    metadata: { userId },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });

  return NextResponse.json({ url: session.url });
});
