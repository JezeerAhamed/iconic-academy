'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, HelpCircle } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    // Hardcode Stripe Prices matching the instruction prompt or via Env Vars 
    const STRIPE_PRICES: Record<string, string> = {
        free: 'free',
        basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'price_basic_placeholder',
        premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium_placeholder',
        elite: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE || 'price_elite_placeholder'
    };

    const PLANS = {
        free: {
            name: 'Free',
            price: 0,
            features: ['1 Subject (First 2 Units)', 'AI Tutor (Basic Limit)', '5 Past Papers / Day']
        },
        basic: {
            name: 'Basic',
            price: 990,
            features: ['All 4 Subjects (Full Syllabus)', 'Unlimited AI Tutor', 'Full MCQ Engine', 'No Video Lessons']
        },
        premium: {
            name: 'Premium',
            price: 1990,
            features: ['Everything in Basic', 'Video Lessons for all Topics', 'AI Marking for Structured Essays', 'Personalized Study Plan']
        },
        elite: {
            name: 'Elite',
            price: 3490,
            features: ['Everything in Premium', 'Weekly Live Doubt Sessions', 'Voice AI Tutoring', 'Parent Dashboard', 'Priority Processing']
        }
    };

    const handleCheckout = async (planKey: string) => {
        if (!user) {
            router.push(`/auth/signup?plan=${planKey}`);
            return;
        }

        if (planKey === 'free') {
            router.push('/dashboard');
            return;
        }

        const currentPlan = (user as any)?.plan || 'free';
        if (currentPlan === planKey) {
            router.push('/dashboard');
            return;
        }

        setLoadingPlan(planKey);

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: STRIPE_PRICES[planKey],
                    userId: user.uid,
                    userEmail: user.email
                }),
            });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Checkout initialization failed');
                setLoadingPlan(null);
            }
        } catch (error) {
            console.error('Checkout error', error);
            alert('A network error occurred');
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 relative overflow-hidden grid-bg">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium text-sm mb-6 uppercase tracking-widest"
                    >
                        <Sparkles className="w-4 h-4" /> Transparent Pricing
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
                    >
                        Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Future</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400"
                    >
                        Choose the plan that fits your learning journey. Upgrade anytime, cancel whenever you want. Fast-track your A/L results today.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                    {Object.entries(PLANS).map(([key, plan], i) => {
                        const isCurrentPlan = user && ((user as any)?.plan || 'free') === key;

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className={`p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm h-full flex flex-col ${key === 'premium'
                                    ? 'bg-gradient-to-b from-indigo-500/10 to-[#0b101a] border-2 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)] lg:-translate-y-4'
                                    : 'bg-[#0b101a] border border-white/10'
                                    }`}
                            >
                                {key === 'premium' && (
                                    <div className="absolute top-0 left-0 right-0 bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest text-center py-1.5">
                                        Most Popular
                                    </div>
                                )}
                                <div className={`mb-8 ${key === 'premium' ? 'pt-4' : ''}`}>
                                    <h3 className="text-2xl font-bold text-white mb-2 capitalize">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl sm:text-4xl font-black text-white">Rs {plan.price.toLocaleString()}</span>
                                        {key !== 'free' && <span className="text-slate-500 font-medium">/mo</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-3 text-slate-300 text-sm sm:text-base">
                                            <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <button
                                        onClick={() => handleCheckout(key)}
                                        disabled={loadingPlan !== null || !!isCurrentPlan}
                                        className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${isCurrentPlan
                                            ? 'bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed'
                                            : key === 'premium'
                                                ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        {loadingPlan === key
                                            ? 'Opening Checkout...'
                                            : isCurrentPlan
                                                ? 'Current Plan'
                                                : key === 'free' && !user
                                                    ? 'Sign Up Free'
                                                    : 'Get Started'}
                                    </button>
                                    {!isCurrentPlan && (
                                        <p className="text-[10px] text-center text-slate-500 mt-3 uppercase tracking-wider font-medium">Cancel anytime. No hidden fees.</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ Snippet */}
                <div className="mt-24 max-w-3xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-white text-center mb-8 inline-flex items-center justify-center gap-3 w-full">
                        <HelpCircle className="w-6 h-6 text-indigo-400" /> FAQ
                    </h2>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h4 className="text-white font-bold mb-2">Can I pay via Bank Transfer instead of a Credit Card?</h4>
                        <p className="text-slate-400 text-sm">Presently, we support Credit/Debit cards through our ultra-secure Stripe gateway. Bank transfers are planned for Phase 3 rollout specifically for Sri Lankan resident bank accounts.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h4 className="text-white font-bold mb-2">Will the AI Tutor give me direct answers to exam questions?</h4>
                        <p className="text-slate-400 text-sm">No. Our AI is configured to use the Socratic method, meaning it guides you step-by-step toward the answer so you drastically improve your actual exam performance instead of just memorizing solutions.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
