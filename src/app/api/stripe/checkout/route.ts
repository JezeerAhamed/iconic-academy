import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Initialize Stripe gracefully, so we don't crash if the env var is missing during setup
const stripeApiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';
const stripe = new Stripe(stripeApiKey, {
    apiVersion: '2023-10-16' as any // Use slightly older or latest API version based on package
});

export async function POST(req: NextRequest) {
    try {
        const { priceId, userId, userEmail } = await req.json();

        if (!priceId || !userId || !userEmail) {
            return NextResponse.json({ error: 'Missing required fields: priceId, userId, userEmail' }, { status: 400 });
        }

        // Attempt to get or create Stripe customer mapped to our Firebase user
        let customerId: string | undefined;

        // Check our 'subscriptions' collection to see if this user previously bought something
        const subDocRef = adminDb.collection('subscriptions').doc(userId);
        const subDoc = await subDocRef.get();

        if (subDoc.exists) {
            customerId = subDoc.data()?.stripeCustomerId;
        }

        if (!customerId) {
            // Create new Stripe customer if they don't exist yet
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: { firebaseUserId: userId }
            });
            customerId = customer.id;

            // Cache the mapping in Firestore
            await subDocRef.set({ stripeCustomerId: customerId }, { merge: true });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${baseUrl}/dashboard/billing?success=true`,
            cancel_url: `${baseUrl}/pricing?cancelled=true`,
            metadata: { userId }, // Critical for linking the webhook back to the user later
            allow_promotion_codes: true,
            billing_address_collection: 'auto'
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Checkout API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
