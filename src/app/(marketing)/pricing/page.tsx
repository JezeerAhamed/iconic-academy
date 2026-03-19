'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const STRIPE_PRICES: Record<'basic' | 'premium' | 'elite', string> = {
  basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'price_basic_placeholder',
  premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium_placeholder',
  elite: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE || 'price_elite_placeholder',
};

const plans = {
  free: {
    name: 'Free',
    price: 0,
    subtitle: 'Try the platform',
    features: ['1 subject', 'First 2 units', 'AI Tutor 10/day', 'Past Papers MCQ 5/day'],
  },
  basic: {
    name: 'Basic',
    price: 990,
    subtitle: 'For daily self-study',
    features: ['All 4 subjects', 'Full syllabus access', 'Unlimited AI tutor', 'Unlimited MCQ past papers'],
  },
  premium: {
    name: 'Premium',
    price: 1990,
    subtitle: 'For students pushing for top grades',
    features: ['Everything in Basic', 'Video lessons', 'AI essay grading', 'Personalized study plan'],
  },
  elite: {
    name: 'Elite',
    price: 3490,
    subtitle: 'For maximum support',
    features: ['Everything in Premium', 'Weekly live sessions', 'Voice AI', 'Parent dashboard'],
  },
} as const;

const comparisonRows = [
  ['Subjects', '1', '4', '4', '4'],
  ['Units', '2', 'All', 'All', 'All'],
  ['AI Tutor', '10/day', 'Unl', 'Unl', 'Unl'],
  ['Past Papers MCQ', '5/day', 'Unl', 'Unl', 'Unl'],
  ['Video Lessons', 'No', 'No', 'Yes', 'Yes'],
  ['AI Essay Grading', 'No', 'No', 'Yes', 'Yes'],
  ['Study Plan', 'No', 'No', 'Yes', 'Yes'],
  ['Live Sessions', 'No', 'No', 'No', 'Yes'],
  ['Voice AI', 'No', 'No', 'No', 'Yes'],
  ['Parent Dashboard', 'No', 'No', 'No', 'Yes'],
];

const faqs = [
  {
    question: 'Can I switch plans?',
    answer: 'Yes. You can upgrade or downgrade anytime and the change takes effect immediately.',
  },
  {
    question: 'Is there a student discount?',
    answer:
      'All plans are already priced specifically for Sri Lankan students. Group rates are available for schools and tuition batches.',
  },
  {
    question: 'What if I fail my A/L?',
    answer:
      "We offer a full refund if you don't improve your mock exam scores after 30 days. Contact us and we will review it with you.",
  },
  {
    question: 'Do you support Tamil medium?',
    answer:
      'Yes. Our AI tutor responds in Tamil when you write in Tamil. A fuller Tamil UI is planned in the next update.',
  },
  {
    question: 'Can I pay by card securely?',
    answer: 'Yes. Paid plans use Stripe checkout for secure card payments and subscription management.',
  },
];

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastAttemptedPlan, setLastAttemptedPlan] = useState<keyof typeof plans | null>(null);

  const currentPlan = profile?.plan ?? 'free';

  const handleCheckout = async (planKey: keyof typeof plans) => {
    setCheckoutError(null);
    setLastAttemptedPlan(planKey);

    if (!user) {
      router.push(`/auth/signup?plan=${planKey}`);
      return;
    }

    if (planKey === 'free' || currentPlan === planKey) {
      router.push('/dashboard');
      return;
    }

    setLoadingPlan(planKey);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: STRIPE_PRICES[planKey as 'basic' | 'premium' | 'elite'],
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Checkout initialization failed.');
      }

      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Something went wrong.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cgray-50 border-b border-cgray-200 py-16">
        <div className="c-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-cblue-500 uppercase tracking-wider mb-3 inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Transparent pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-cgray-900 mb-3"
          >
            Pick the Plan That Matches Your Study Pace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-cgray-600 max-w-xl mx-auto"
          >
            Start free, upgrade whenever you need more support, and keep the tools that actually help you study better.
          </motion.p>
        </div>
      </div>

      <div className="c-container py-16">

        {checkoutError ? (
          <div className="mx-auto mb-8 max-w-3xl rounded border border-cred-500/20 bg-cred-50 p-4 text-sm text-cred-600">
            <p>{checkoutError}</p>
            <button
              type="button"
              onClick={() => {
                if (lastAttemptedPlan) {
                  void handleCheckout(lastAttemptedPlan);
                  return;
                }

                setCheckoutError(null);
              }}
              className="btn-secondary btn-sm mt-3"
            >
              Try again
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {Object.entries(plans).map(([key, plan], index) => {
            const isCurrentPlan = currentPlan === key;
            const isFeatured = key === 'premium';

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`${
                  isFeatured
                    ? 'relative flex flex-col gap-4 p-6 rounded border-2 border-cblue-500 bg-white shadow-card-hover'
                    : 'c-card p-6 flex flex-col gap-4'
                }`}
              >
                {isFeatured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cblue-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                ) : null}

                <div className={isFeatured ? 'pt-4' : ''}>
                  <p className="text-sm font-semibold text-cgray-500 uppercase tracking-wider">{plan.name}</p>
                  <p className="text-sm text-cgray-500 mt-1">{plan.subtitle}</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    {key === 'free' ? (
                      <span className="text-4xl font-bold text-cgray-900">Free</span>
                    ) : (
                      <>
                        <span className="text-base text-cgray-500">Rs</span>
                        <span className="text-4xl font-bold text-cgray-900">{plan.price.toLocaleString()}</span>
                        <span className="text-base text-cgray-500">/mo</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-cgray-700">
                      <Check className="text-cgreen-500 mt-0.5 flex-shrink-0 text-base h-4 w-4" strokeWidth={3} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(key as keyof typeof plans)}
                  disabled={loadingPlan !== null || isCurrentPlan}
                  className={`w-full mt-auto ${
                    isCurrentPlan
                      ? 'btn-secondary opacity-70 cursor-not-allowed'
                      : isFeatured
                        ? 'btn-primary'
                        : key === 'free'
                          ? 'btn-secondary'
                          : 'btn-primary'
                  }`}
                >
                  {loadingPlan === key
                    ? 'Opening Checkout...'
                    : isCurrentPlan
                      ? 'Current Plan'
                      : !user
                        ? key === 'free'
                          ? 'Sign Up Free'
                          : `Choose ${plan.name}`
                        : 'Upgrade Now'}
                </button>

                {!isCurrentPlan ? (
                  <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wider text-cgray-500">
                    Cancel anytime. No hidden fees.
                  </p>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <section className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-cgray-900">Feature comparison</h2>
            <p className="mt-3 text-cgray-600">A clearer side-by-side view of what opens up at each plan level.</p>
          </div>

          <div className="overflow-hidden rounded border border-cgray-200 bg-white">
            <div className="grid grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] gap-px bg-cgray-200 text-sm">
              <div className="bg-cgray-50 p-4 font-semibold text-cgray-900">Feature</div>
              {['Free', 'Basic', 'Premium', 'Elite'].map((column) => (
                <div key={column} className="bg-cgray-50 p-4 text-center font-semibold text-cgray-900">
                  {column}
                </div>
              ))}

              {comparisonRows.map((row) => (
                <PricingRow key={row[0]} row={row} />
              ))}
            </div>
          </div>
        </section>

        <section className="c-container py-16 border-t border-cgray-200 mt-16 px-0">
          <h2 className="text-2xl font-bold text-cgray-900 mb-6 inline-flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-cblue-500" /> FAQ
          </h2>

          {faqs.map((faq) => (
            <div key={faq.question} className="border-b border-cgray-200 py-4">
              <h4 className="text-base font-semibold text-cgray-900 cursor-pointer flex items-center justify-between">
                <span>{faq.question}</span>
              </h4>
              <p className="text-base text-cgray-600 mt-2 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function PricingRow({ row }: { row: string[] }) {
  return (
    <>
      {row.map((cell, index) => (
        <div
          key={`${row[0]}-${index}`}
          className={`bg-white p-4 text-sm ${
            index === 0 ? 'font-medium text-cgray-900' : 'text-center text-cgray-700'
          }`}
        >
          {cell}
        </div>
      ))}
    </>
  );
}
