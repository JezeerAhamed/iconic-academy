import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serverEnv } from '@/lib/env';
import { sanitiseInput } from '@/lib/sanitise';
import { withSecurity } from '@/lib/with-security';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(serverEnv.stripeSecretKey, {
  apiVersion: '2023-10-16' as never,
});

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription | Stripe.Response<Stripe.Subscription>) {
  const unixSeconds = (subscription as unknown as { current_period_end?: number }).current_period_end;
  return unixSeconds ? new Date(unixSeconds * 1000) : null;
}

export const POST = withSecurity(
  async (request: NextRequest) => {
    const bodyText = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(bodyText, signature, serverEnv.stripeWebhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed.', error);
      return new NextResponse('Webhook Error', { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = sanitiseInput(session.metadata?.userId || '', { maxLength: 128, stripHtml: false });
        const customerId = sanitiseInput(String(session.customer || ''), { maxLength: 128, stripHtml: false });
        const subscriptionId = sanitiseInput(String(session.subscription || ''), { maxLength: 128, stripHtml: false });

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = sanitiseInput(subscription.items.data[0].price.id, { maxLength: 128, stripHtml: false });
          const productId = sanitiseInput(String(subscription.items.data[0].price.product || ''), { maxLength: 128, stripHtml: false });
          const product = await stripe.products.retrieve(productId);
          const tier = sanitiseInput(product.metadata?.tier || 'basic', { maxLength: 32, stripHtml: false });

          const subRef = adminDb.collection('subscriptions').doc(userId);
          await subRef.set(
            {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: subscription.status,
              currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
              tier,
              priceId,
            },
            { merge: true }
          );

          await adminDb.collection('users').doc(userId).set({ plan: tier }, { merge: true });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = sanitiseInput(String(subscription.customer || ''), { maxLength: 128, stripHtml: false });
        const subQuery = await adminDb.collection('subscriptions').where('stripeCustomerId', '==', customerId).limit(1).get();

        if (!subQuery.empty) {
          const subDoc = subQuery.docs[0];
          const userId = subDoc.id;
          const productId = sanitiseInput(String(subscription.items.data[0].price.product || ''), { maxLength: 128, stripHtml: false });
          const product = await stripe.products.retrieve(productId);
          const tier = sanitiseInput(product.metadata?.tier || 'basic', { maxLength: 32, stripHtml: false });

          await subDoc.ref.update({
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
            tier,
          });

          await adminDb.collection('users').doc(userId).update({
            plan: subscription.status === 'active' || subscription.status === 'trialing' ? tier : 'free',
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = sanitiseInput(String(subscription.customer || ''), { maxLength: 128, stripHtml: false });
        const subQuery = await adminDb.collection('subscriptions').where('stripeCustomerId', '==', customerId).limit(1).get();

        if (!subQuery.empty) {
          const subDoc = subQuery.docs[0];
          const userId = subDoc.id;

          await subDoc.ref.update({
            status: 'canceled',
            tier: 'free',
          });

          await adminDb.collection('users').doc(userId).update({ plan: 'free' });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe webhook event: ${event.type}`);
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  },
  {
    skipOriginCheck: true,
    skipJsonContentType: true,
    maxContentLengthBytes: 2 * 1024 * 1024,
  }
);
