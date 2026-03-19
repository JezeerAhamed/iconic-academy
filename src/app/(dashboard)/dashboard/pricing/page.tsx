'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Check, X, Shield, Sparkles, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = [
  {
    id: 'free',
    name: 'Basic Explorer',
    price: 'LKR 0',
    duration: '/month',
    description: 'Perfect for getting a feel of the ICONIC ACADEMY ecosystem.',
    icon: Shield,
    accent: 'text-cgray-600',
    accentBg: 'bg-cgray-100',
    popular: false,
    features: [
      { name: 'Access to Unit 1 of all subjects', included: true },
      { name: 'Basic AI Tutor (10 questions/day)', included: true },
      { name: 'Daily Study Planner', included: true },
      { name: 'Full Syllabus Video Lessons', included: false },
      { name: 'Unlimited Past Papers & Video Sols', included: false },
      { name: 'Priority AI Voice Features', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Scholar',
    price: 'LKR 2,500',
    duration: '/month',
    description: 'The standard choice for dedicated A/L students aiming for an A pass.',
    icon: Sparkles,
    accent: 'text-cblue-500',
    accentBg: 'bg-cblue-50',
    popular: true,
    features: [
      { name: 'Access to all units & subjects', included: true },
      { name: 'Unlimited AI Tutor access', included: true },
      { name: 'Daily Study Planner', included: true },
      { name: 'Full Syllabus Video Lessons', included: true },
      { name: 'Past Papers (MCQ Graded only)', included: true },
      { name: 'Priority AI Voice Features', included: false },
    ],
  },
  {
    id: 'elite',
    name: 'Island Ranker',
    price: 'LKR 4,900',
    duration: '/month',
    description: 'Everything you need to secure a top Island Rank. No compromises.',
    icon: Crown,
    accent: 'text-cyellow-500',
    accentBg: 'bg-cyellow-50',
    popular: false,
    features: [
      { name: 'Access to all units & subjects', included: true },
      { name: 'Unlimited AI Tutor access', included: true },
      { name: 'Daily Study Planner', included: true },
      { name: 'Full Syllabus Video Lessons', included: true },
      { name: 'Unlimited Past Papers & Video Sols', included: true },
      { name: 'Priority AI Voice Features', included: true },
    ],
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  return (
    <div className="mx-auto max-w-coursera space-y-12 px-6 pb-12">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-4xl font-bold text-cgray-900 md:text-5xl">Invest in your A/L success</h1>
        <p className="text-lg leading-relaxed text-cgray-600">
          Upgrade your ICONIC ACADEMY experience to unlock the full power of the AI Tutor, complete
          syllabus videos, and island-ranked past paper solutions.
        </p>

        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-cgray-200 bg-cgray-50 p-1.5">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={billingCycle === 'monthly' ? 'btn-primary btn-sm rounded-full' : 'btn-ghost btn-sm rounded-full'}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annually')}
            className={billingCycle === 'annually' ? 'btn-primary btn-sm rounded-full' : 'btn-ghost btn-sm rounded-full'}
          >
            Annual Billing
            <span className="ml-2 rounded bg-cgreen-50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cgreen-600">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const isAnnual = billingCycle === 'annually';
          let displayPrice = plan.price;
          if (isAnnual && plan.id !== 'free') {
            const numPrice = parseInt(plan.price.replace(/[^\d]/g, ''));
            const annualPrice = Math.round((numPrice * 12) * 0.8 / 12);
            displayPrice = `LKR ${annualPrice.toLocaleString()}`;
          }

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {plan.popular ? (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                  <span className="rounded-full bg-cblue-500 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              ) : null}

              <Card className={`${plan.popular ? 'border-2 border-cblue-500' : 'c-card'} p-8`}>
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${plan.accentBg} ${plan.accent}`}>
                  <plan.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-cgray-900">{plan.name}</h3>
                <div className="mb-4 flex items-end gap-1">
                  <span className="text-4xl font-bold text-cgray-900">{displayPrice}</span>
                  <span className="pb-1 text-sm font-medium text-cgray-500">{plan.duration}</span>
                </div>
                <p className="mb-6 min-h-[60px] text-sm leading-relaxed text-cgray-600">{plan.description}</p>

                <div className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3 text-sm">
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${feature.included ? 'bg-cgreen-50 text-cgreen-500' : 'bg-cgray-100 text-cgray-400'}`}>
                        {feature.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      <span className={feature.included ? 'text-cgray-700' : 'text-cgray-400'}>{feature.name}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full ${plan.popular ? 'btn-primary' : plan.id === 'elite' ? 'btn-secondary' : 'btn-secondary'}`}>
                  {plan.id === 'free' ? 'Current Plan' : `Upgrade to ${plan.name.split(' ')[0]}`}
                  {plan.popular ? <Zap className="ml-2 h-4 w-4" /> : null}
                </button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-cgray-500">
          <Shield className="h-4 w-4" /> Secure payments powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
