import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const stripeApiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

const stripe = new Stripe(stripeApiKey, {
    apiVersion: '2023-10-16' as any
});

export async function POST(req: NextRequest) {
    const bodyText = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        // Only verify signatures if we actually gave the secret to the server
        if (endpointSecret && endpointSecret !== 'whsec_placeholder') {
            event = stripe.webhooks.constructEvent(bodyText, signature, endpointSecret);
        } else {
            event = JSON.parse(bodyText) as Stripe.Event; // fallback for unverified testing
        }
    } catch (err: any) {
        console.error(`Webhook signature verification failed. ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {

            // When a user successfully finishes the checkout flow
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;

                if (userId && subscriptionId) {
                    // Fetch the subscription securely from Stripe to get the actual Product Tier
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = subscription.items.data[0].price.id;
                    const productId = subscription.items.data[0].price.product as string;

                    // Fetch product metadata to determine the exact tier (e.g. { tier: 'premium' })
                    const product = await stripe.products.retrieve(productId);
                    const tier = product.metadata?.tier || 'basic'; // Default fallback assumption

                    // 1. Update Subscriptions tracking collection
                    const subRef = adminDb.collection('subscriptions').doc(userId);
                    await subRef.set({
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        status: subscription.status,
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        tier: tier,
                        priceId: priceId
                    }, { merge: true });

                    // 2. Grant the ultimate Tier rank in the core `users` collection explicitly 
                    const userRef = adminDb.collection('users').doc(userId);
                    await userRef.set({ plan: tier }, { merge: true });
                }
                break;
            }

            // When a user upgrades or Stripe renews successfully
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Reverse lookup user by customerId
                const subQuery = await adminDb.collection('subscriptions').where('stripeCustomerId', '==', customerId).limit(1).get();
                if (!subQuery.empty) {
                    const subDoc = subQuery.docs[0];
                    const userId = subDoc.id;

                    const productId = subscription.items.data[0].price.product as string;
                    const product = await stripe.products.retrieve(productId);
                    const tier = product.metadata?.tier || 'basic';

                    await subDoc.ref.update({
                        stripeSubscriptionId: subscription.id,
                        status: subscription.status,
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        tier: tier
                    });

                    if (subscription.status === 'active' || subscription.status === 'trialing') {
                        await adminDb.collection('users').doc(userId).update({ plan: tier });
                    } else if (subscription.status === 'past_due' || subscription.status === 'canceled' || subscription.status === 'unpaid') {
                        await adminDb.collection('users').doc(userId).update({ plan: 'free' });
                    }
                }
                break;
            }

            // When a user deletes/cancels their subscription completely at the end of billing cycle
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const subQuery = await adminDb.collection('subscriptions').where('stripeCustomerId', '==', customerId).limit(1).get();
                if (!subQuery.empty) {
                    const subDoc = subQuery.docs[0];
                    const userId = subDoc.id;

                    await subDoc.ref.update({
                        status: 'canceled',
                        tier: 'free'
                    });

                    await adminDb.collection('users').doc(userId).update({ plan: 'free' });
                }
                break;
            }

            default:
                console.log(`Unhandled Stripe Webhook Event type: ${event.type}`);
        }

        return new NextResponse('Webhook processed successfully', { status: 200 });
    } catch (error: any) {
        console.error('Webhook Handler Error:', error);
        return new NextResponse('Webhook Handler Failed', { status: 500 });
    }
}
