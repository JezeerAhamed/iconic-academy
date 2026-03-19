'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BillingToggle, { BillingPeriod } from '@/components/conversion/BillingToggle';
import EarlyAccessBadge from '@/components/conversion/EarlyAccessBadge';
import PaymentTrustBadges from '@/components/conversion/PaymentTrustBadges';
import PricingFaqAccordion, { PricingFaqItem } from '@/components/conversion/PricingFaqAccordion';
import PricingUrgencyBanner from '@/components/conversion/PricingUrgencyBanner';
import WhatsAppFloatingButton from '@/components/conversion/WhatsAppFloatingButton';
import { useAuth } from '@/lib/contexts/AuthContext';

const BILLING_STORAGE_KEY = 'iconic-pricing-billing-period';

const STRIPE_PRICES = {
  monthly: {
    basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'price_basic_placeholder',
    premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium_placeholder',
    elite: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE || 'price_elite_placeholder',
  },
  annual: {
    basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL || '',
    premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL || '',
    elite: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_ANNUAL || '',
  },
} as const;

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

const faqs: PricingFaqItem[] = [
  {
    question: 'Can I pay via Bank Transfer instead of a Credit Card?',
    answer:
      'Yes. Card payments run through Stripe at checkout, and if you prefer a bank transfer you can message us on WhatsApp to arrange a manual activation for your plan.',
  },
  {
    question: 'Will the AI Tutor give me direct answers to exam questions?',
    answer:
      'The AI Tutor is designed to coach understanding first. It explains the method, points out mistakes, and helps you think like an examiner instead of handing out blind final answers.',
  },
  {
    question: 'Can I study offline or on mobile?',
    answer:
      'Yes, the platform is built mobile-first and works well on phones. Some features like AI chat still need an internet connection, but lessons and planning are designed for students who study mostly on mobile devices.',
  },
  {
    question: 'What language is the content in?',
    answer:
      'Core lessons are delivered in clear English, and the AI Tutor can respond in Tamil when students write in Tamil. We are continuing to expand the bilingual experience across the platform.',
  },
  {
    question: 'How is this different from YouTube tutorials?',
    answer:
      'YouTube helps you watch. ICONIC ACADEMY helps you finish the syllabus. You get structured units, guided practice, progress tracking, and an AI Tutor that stays with your exact A/L workflow.',
  },
  {
    question: 'What happens if I miss a live doubt session? (Elite plan)',
    answer:
      'Elite students can catch up afterward with session notes, follow-up support, and the rest of the platform tools. Missing one live session does not lock you out of the rest of your study plan.',
  },
  {
    question: 'Can I switch between plans anytime?',
    answer:
      'Yes. You can start free, upgrade when you need more support, and move between paid plans as your study season changes. Your learning history stays with your account.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'Yes. Paid plans are covered by a 7-day refund window. If the platform is not the right fit, contact support within 7 days and we will review the request with you quickly.',
  },
];

type PlanKey = keyof typeof plans;
type PaidPlanKey = Exclude<PlanKey, 'free'>;

function getAnnualTotal(monthlyPrice: number) {
  return monthlyPrice * 10;
}

function getAnnualMonthlyEquivalent(monthlyPrice: number) {
  return Math.round(getAnnualTotal(monthlyPrice) / 12);
}

function formatCurrency(value: number) {
  return value.toLocaleString();
}

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastAttemptedPlan, setLastAttemptedPlan] = useState<PlanKey | null>(null);

  const currentPlan = profile?.plan ?? 'free';

  useEffect(() => {
    const savedBillingPeriod = window.localStorage.getItem(BILLING_STORAGE_KEY);
    if (savedBillingPeriod === 'monthly' || savedBillingPeriod === 'annual') {
      setBillingPeriod(savedBillingPeriod);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(BILLING_STORAGE_KEY, billingPeriod);
  }, [billingPeriod]);

  const annualCheckoutConfigured = useMemo(
    () => Object.values(STRIPE_PRICES.annual).every(Boolean),
    []
  );

  const handleCheckout = async (planKey: PlanKey) => {
    setCheckoutError(null);
    setLastAttemptedPlan(planKey);

    if (!user) {
      router.push(`/auth/signup?plan=${planKey}&billing=${billingPeriod}`);
      return;
    }

    if (planKey === 'free' || currentPlan === planKey) {
      router.push('/dashboard');
      return;
    }

    const priceId = STRIPE_PRICES[billingPeriod][planKey as PaidPlanKey];

    if (!priceId) {
      setCheckoutError(
        'Annual checkout is not configured yet. Use the WhatsApp button and we will help you activate the discounted yearly plan right away.'
      );
      return;
    }

    setLoadingPlan(planKey);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PricingUrgencyBanner />

      <div className="border-b border-cgray-200 bg-cgray-50 py-16 dark:border-white/10 dark:bg-slate-950">
        <div className="c-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-cblue-500"
          >
            <Sparkles className="h-4 w-4" />
            Transparent pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-4xl font-bold text-cgray-900 dark:text-slate-100"
          >
            Pick the Plan That Matches Your Study Pace
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-cgray-600 dark:text-slate-300"
          >
            Start free, upgrade whenever you need more support, and keep the tools that actually help you study better.
          </motion.p>

          <div className="mt-5 flex justify-center">
            <EarlyAccessBadge />
          </div>

          <div className="mt-8 flex justify-center">
            <BillingToggle value={billingPeriod} onChange={setBillingPeriod} />
          </div>

          {billingPeriod === 'annual' && !annualCheckoutConfigured ? (
            <p className="mt-4 text-sm text-cgray-500 dark:text-slate-400">
              Annual pricing is live in the UI. If yearly Stripe checkout is not ready yet, WhatsApp us and we will activate it manually.
            </p>
          ) : null}
        </div>
      </div>

      <div className="c-container py-16">
        {checkoutError ? (
          <div className="mx-auto mb-8 max-w-3xl rounded border border-cred-500/20 bg-cred-50 p-4 text-sm text-cred-500 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
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

        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(plans).map(([key, plan], index) => {
            const isCurrentPlan = currentPlan === key;
            const isFeatured = key === 'premium';
            const isFreePlan = key === 'free';
            const annualMonthlyEquivalent = isFreePlan ? 0 : getAnnualMonthlyEquivalent(plan.price);
            const annualTotal = isFreePlan ? 0 : getAnnualTotal(plan.price);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={
                  isFeatured
                    ? 'relative flex flex-col gap-4 rounded border-2 border-cblue-500 bg-white p-6 shadow-card-hover dark:bg-slate-900'
                    : 'c-card flex flex-col gap-4 p-6 dark:bg-slate-900'
                }
              >
                {isFeatured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cblue-500 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white">
                    Most Popular
                  </div>
                ) : null}

                <div className={isFeatured ? 'pt-4' : ''}>
                  <p className="text-sm font-semibold uppercase tracking-wider text-cgray-500 dark:text-slate-400">
                    {plan.name}
                  </p>
                  <p className="mt-1 text-sm text-cgray-500 dark:text-slate-400">{plan.subtitle}</p>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${key}-${billingPeriod}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="mt-3"
                    >
                      {isFreePlan ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-cgray-900 dark:text-slate-100">Free</span>
                        </div>
                      ) : billingPeriod === 'monthly' ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-base text-cgray-500 dark:text-slate-400">Rs</span>
                          <span className="text-4xl font-bold text-cgray-900 dark:text-slate-100">
                            {formatCurrency(plan.price)}
                          </span>
                          <span className="text-base text-cgray-500 dark:text-slate-400">/mo</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-base text-cgray-400 line-through dark:text-slate-500">
                              Rs {formatCurrency(plan.price)}/mo
                            </span>
                            <span className="text-base text-cgray-500 dark:text-slate-400">Rs</span>
                            <span className="text-4xl font-bold text-cgray-900 dark:text-slate-100">
                              {formatCurrency(annualMonthlyEquivalent)}
                            </span>
                            <span className="text-base text-cgray-500 dark:text-slate-400">/mo</span>
                          </div>
                          <p className="mt-2 text-sm text-cgreen-600 dark:text-green-300">
                            Billed annually as Rs {formatCurrency(annualTotal)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ul className="flex flex-1 flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-cgray-700 dark:text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cgreen-500" strokeWidth={3} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(key as PlanKey)}
                  disabled={loadingPlan !== null || isCurrentPlan}
                  className={`mt-auto w-full ${
                    isCurrentPlan
                      ? 'btn-secondary cursor-not-allowed opacity-70'
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
                          : billingPeriod === 'annual'
                            ? `Choose ${plan.name} Annual`
                            : `Choose ${plan.name}`
                        : billingPeriod === 'annual' && key !== 'free'
                          ? 'Upgrade Annually'
                          : 'Upgrade Now'}
                </button>

                {!isCurrentPlan ? (
                  <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wider text-cgray-500 dark:text-slate-400">
                    {billingPeriod === 'annual' && key !== 'free' ? 'Save 17% with yearly billing.' : 'Cancel anytime. No hidden fees.'}
                  </p>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <PaymentTrustBadges />

        <section className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-cgray-900 dark:text-slate-100">Feature comparison</h2>
            <p className="mt-3 text-cgray-600 dark:text-slate-300">
              A clearer side-by-side view of what opens up at each plan level.
            </p>
          </div>

          <div className="overflow-hidden rounded border border-cgray-200 bg-white dark:border-white/10 dark:bg-slate-900">
            <div className="grid grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] gap-px bg-cgray-200 text-sm dark:bg-white/10">
              <div className="bg-cgray-50 p-4 font-semibold text-cgray-900 dark:bg-slate-950 dark:text-slate-100">
                Feature
              </div>
              {['Free', 'Basic', 'Premium', 'Elite'].map((column) => (
                <div
                  key={column}
                  className="bg-cgray-50 p-4 text-center font-semibold text-cgray-900 dark:bg-slate-950 dark:text-slate-100"
                >
                  {column}
                </div>
              ))}

              {comparisonRows.map((row) => (
                <PricingRow key={row[0]} row={row} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-cgray-200 pt-16 dark:border-white/10">
          <div className="mb-6">
            <p className="c-section-label">FAQ</p>
            <h2 className="text-2xl font-bold text-cgray-900 dark:text-slate-100">
              Questions students usually ask before upgrading
            </h2>
          </div>

          <PricingFaqAccordion items={faqs} />
        </section>
      </div>

      <WhatsAppFloatingButton message="Hi, I'd like to know more about Iconic Academy" />
    </div>
  );
}

function PricingRow({ row }: { row: string[] }) {
  return (
    <>
      {row.map((cell, index) => (
        <div
          key={`${row[0]}-${index}`}
          className={`bg-white p-4 text-sm dark:bg-slate-900 ${
            index === 0
              ? 'font-medium text-cgray-900 dark:text-slate-100'
              : 'text-center text-cgray-700 dark:text-slate-300'
          }`}
        >
          {cell}
        </div>
      ))}
    </>
  );
}
