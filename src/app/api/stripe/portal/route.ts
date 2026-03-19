import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serverEnv } from '@/lib/env';
import { sanitiseInput } from '@/lib/sanitise';
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
  const body = (await request.json()) as { userId?: string };
  const userId = sanitiseInput(body.userId || '', { maxLength: 128, stripHtml: false });

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const subDoc = await adminDb.collection('subscriptions').doc(userId).get();
  const customerId = sanitiseInput(String(subDoc.data()?.stripeCustomerId || ''), { maxLength: 128, stripHtml: false });

  if (!customerId) {
    return NextResponse.json({ error: 'No Stripe customer found for user.' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${serverEnv.appUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
});
