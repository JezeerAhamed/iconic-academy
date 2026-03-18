'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Sparkles, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = [
    {
        id: 'free',
        name: 'Basic Explorer',
        price: 'LKR 0',
        duration: '/month',
        description: 'Perfect for getting a feel of the ICONIC ACADEMY ecosystem.',
        icon: Shield,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-white/10',
        glow: '',
        popular: false,
        features: [
            { name: 'Access to Unit 1 of all subjects', included: true },
            { name: 'Basic AI Tutor (10 questions/day)', included: true },
            { name: 'Daily Study Planner', included: true },
            { name: 'Full Syllabus Video Lessons', included: false },
            { name: 'Unlimited Past Papers & Video Sols', included: false },
            { name: 'Priority AI Voice Features', included: false },
        ]
    },
    {
        id: 'pro',
        name: 'Pro Scholar',
        price: 'LKR 2,500',
        duration: '/month',
        description: 'The standard choice for dedicated A/L students aiming for an A pass.',
        icon: Sparkles,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/50',
        glow: 'shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-indigo-500/30',
        popular: true,
        features: [
            { name: 'Access to all units & subjects', included: true },
            { name: 'Unlimited AI Tutor access', included: true },
            { name: 'Daily Study Planner', included: true },
            { name: 'Full Syllabus Video Lessons', included: true },
            { name: 'Past Papers (MCQ Graded only)', included: true },
            { name: 'Priority AI Voice Features', included: false },
        ]
    },
    {
        id: 'elite',
        name: 'Island Ranker',
        price: 'LKR 4,900',
        duration: '/month',
        description: 'Everything you need to secure a top Island Rank. No compromises.',
        icon: Crown,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-amber-500/20',
        popular: false,
        features: [
            { name: 'Access to all units & subjects', included: true },
            { name: 'Unlimited AI Tutor access', included: true },
            { name: 'Daily Study Planner', included: true },
            { name: 'Full Syllabus Video Lessons', included: true },
            { name: 'Unlimited Past Papers & Video Sols', included: true },
            { name: 'Priority AI Voice Features', included: true },
        ]
    }
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto pt-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">A/L Success</span></h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Upgrade your ICONIC ACADEMY experience to unlock the full power of the AI Tutor, complete syllabus videos, and island-ranked past paper solutions.
                </p>

                <div className="flex items-center justify-center gap-3 mt-8 bg-[#0b101a] p-1.5 inline-flex rounded-full border border-white/10 mx-auto">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Monthly Billing
                    </button>
                    <button
                        onClick={() => setBillingCycle('annually')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annually' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Annual Billing <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider rounded-md">Save 20%</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {PLANS.map((plan, i) => {
                    // Calculate annual pricing
                    const isAnnual = billingCycle === 'annually';
                    let displayPrice = plan.price;
                    if (isAnnual && plan.id !== 'free') {
                        const numPrice = parseInt(plan.price.replace(/[^\d]/g, ''));
                        const annualPrice = Math.round((numPrice * 12) * 0.8 / 12); // 20% discount, displayed as monthly equivalent
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
                            {plan.popular && (
                                <div className="absolute -top-4 w-full flex justify-center z-10">
                                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <Card className={`p-8 bg-[#0b101a] transition-all flex flex-col h-full relative ${plan.border} ${plan.glow}`}>
                                {/* Background glow for cards */}
                                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-50 pointer-events-none ${plan.bg}`} />

                                <div className="mb-6 relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/5 ${plan.bg}`}>
                                        <plan.icon className={`w-6 h-6 ${plan.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-end gap-1 mb-4">
                                        <span className="text-4xl font-black text-white">{displayPrice}</span>
                                        <span className="text-slate-400 text-sm font-medium pb-1">{plan.duration}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed min-h-[60px]">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="flex-1 space-y-4 mb-8 relative z-10">
                                    {plan.features.map((feature, j) => (
                                        <div key={j} className="flex items-start gap-3 text-sm">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feature.included ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-600'
                                                }`}>
                                                {feature.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            </div>
                                            <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                                                {feature.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className={`w-full h-12 font-bold relative z-10 ${plan.popular
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0'
                                            : plan.id === 'elite'
                                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                        }`}
                                >
                                    {plan.id === 'free' ? 'Current Plan' : `Upgrade to ${plan.name.split(' ')[0]}`}
                                    {plan.popular && <Zap className="w-4 h-4 ml-2" />}
                                </Button>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-16 text-center">
                <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" /> Secure payments powered by Stripe. Cancel anytime.
                </p>
            </div>
        </div>
    );
}
