'use client';

import { motion } from 'framer-motion';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { Check, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
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
                        <Sparkles className="w-4 h-4" /> Simple Pricing
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
                        Choose the plan that fits your learning journey. Upgrade anytime, cancel whenever you want. High-quality A/L education has never been this accessible.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan], i) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className={`p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm ${key === 'pro'
                                    ? 'bg-gradient-to-b from-indigo-500/10 to-[#0b101a] border-2 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)] md:-translate-y-4'
                                    : 'bg-[#0b101a] border border-white/10'
                                }`}
                        >
                            {key === 'pro' && (
                                <div className="absolute top-0 left-0 right-0 bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest text-center py-1.5">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2 capitalize">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">LKR {plan.price.toLocaleString()}</span>
                                    <span className="text-slate-500 font-medium">/mo</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-start gap-3 text-slate-300">
                                        <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/auth/signup" className="block w-full">
                                <button className={`w-full py-4 rounded-xl font-bold transition-all ${key === 'pro'
                                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/5 hover:bg-white/10 text-white'
                                    }`}>
                                    {key === 'free' ? 'Start for Free' : 'Get Started'}
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Snippet or extra trust signal */}
                <div className="mt-24 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto">Our support team is ready to help you choose the right path for your A/L success.</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300">
                        Contact Support <Zap className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
