'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="section-pad bg-[#060a11]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-3xl p-12 overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(59,130,246,0.10) 100%)',
                        border: '1px solid rgba(99,102,241,0.3)',
                    }}
                >
                    {/* Background decoration */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
                            <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>

                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                            Your A-Grade Journey <br />
                            <span className="gradient-text">Starts Today</span>
                        </h2>

                        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                            Join 2,400+ students already mastering A/L with AI. Free to start — no credit card required.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/signup">
                                <Button
                                    size="lg"
                                    className="h-14 px-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-2xl shadow-indigo-500/30 font-semibold text-base rounded-2xl hover:scale-105 transition-all duration-300"
                                >
                                    Create Free Account
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/subjects">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-10 bg-white/5 border-white/10 text-white hover:bg-white/10 font-medium text-base rounded-2xl"
                                >
                                    Browse Subjects
                                </Button>
                            </Link>
                        </div>

                        <p className="text-slate-500 text-sm mt-6">
                            ✓ Free forever plan &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Cancel anytime
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
