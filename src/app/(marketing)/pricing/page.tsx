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
    <div className="relative min-h-screen overflow-hidden pb-24 pt-32 grid-bg">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[400px] w-full max-w-4xl -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium uppercase tracking-widest text-indigo-400"
          >
            <Sparkles className="h-4 w-4" /> Transparent pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-black tracking-tight text-white md:text-6xl"
          >
            Pick the Plan That Matches Your Study Pace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            Start free, upgrade whenever you need more support, and keep the tools that actually help you study better.
          </motion.p>
        </div>

        {checkoutError ? (
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
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
              className="mt-3 rounded-lg bg-white/10 px-3 py-2 font-medium text-white hover:bg-white/15"
            >
              Try again
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(plans).map(([key, plan], index) => {
            const isCurrentPlan = currentPlan === key;
            const isFeatured = key === 'premium';

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-sm ${
                  isFeatured
                    ? 'border-2 border-indigo-500 bg-gradient-to-b from-indigo-500/10 to-[#0b101a] shadow-[0_0_40px_rgba(99,102,241,0.2)] lg:-translate-y-4'
                    : 'border border-white/10 bg-[#0b101a]'
                }`}
              >
                {isFeatured ? (
                  <div className="absolute inset-x-0 top-0 bg-indigo-500 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-white">
                    Most Popular
                  </div>
                ) : null}

                <div className={`mb-8 ${isFeatured ? 'pt-4' : ''}`}>
                  <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="mb-4 text-sm text-slate-400">{plan.subtitle}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white sm:text-4xl">Rs {plan.price.toLocaleString()}</span>
                    {key !== 'free' ? <span className="font-medium text-slate-500">/mo</span> : null}
                  </div>
                </div>

                <ul className="mb-8 flex-grow space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-300 sm:text-base">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                        <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(key as keyof typeof plans)}
                  disabled={loadingPlan !== null || isCurrentPlan}
                  className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-all ${
                    isCurrentPlan
                      ? 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-400'
                      : isFeatured
                        ? 'bg-indigo-500 text-white shadow-indigo-500/25 hover:bg-indigo-600'
                        : 'bg-white/10 text-white hover:bg-white/20'
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
                  <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Cancel anytime. No hidden fees.
                  </p>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <section className="mt-24">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white">Feature comparison</h2>
            <p className="mt-3 text-slate-400">A clearer side-by-side view of what opens up at each plan level.</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b101a]">
            <div className="grid grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] gap-px bg-white/10 text-sm">
              <div className="bg-[#111827] p-4 font-semibold text-white">Feature</div>
              {['Free', 'Basic', 'Premium', 'Elite'].map((column) => (
                <div key={column} className="bg-[#111827] p-4 text-center font-semibold text-white">
                  {column}
                </div>
              ))}

              {comparisonRows.map((row) => (
                <PricingRow key={row[0]} row={row} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-3xl space-y-6">
          <h2 className="mb-8 inline-flex w-full items-center justify-center gap-3 text-center text-2xl font-bold text-white">
            <HelpCircle className="h-6 w-6 text-indigo-400" /> FAQ
          </h2>

          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h4 className="mb-2 font-bold text-white">{faq.question}</h4>
              <p className="text-sm text-slate-400">{faq.answer}</p>
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
          className={`bg-[#0b101a] p-4 text-sm ${
            index === 0 ? 'font-medium text-white' : 'text-center text-slate-300'
          }`}
        >
          {cell}
        </div>
      ))}
    </>
  );
}
