'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Star, Sparkles, Brain, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
            {/* Animated orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-40 -left-20 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                    className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl"
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-8"
                >
                    <Sparkles className="w-4 h-4" />
                    Sri Lanka&apos;s #1 AI-Powered A/L Platform
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-none tracking-tight mb-6"
                >
                    <span className="text-white">Master A/L.</span>
                    <br />
                    <span className="gradient-text">With AI.</span>
                </motion.h1>

                {/* Sub-headline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Physics. Chemistry. Biology. Combined Maths. — Structured lessons, AI tutoring,
                    past papers, and personalized study plans built for Sri Lankan A/L mastery.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Link href="/auth/signup">
                        <Button
                            size="lg"
                            className="h-14 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-2xl shadow-indigo-500/30 font-semibold text-base rounded-2xl glow-brand transition-all duration-300 hover:scale-105"
                        >
                            Start Learning Free
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/subjects">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 font-medium text-base rounded-2xl backdrop-blur-sm transition-all duration-300"
                        >
                            <Play className="w-5 h-5 mr-2 text-indigo-400" />
                            Explore Subjects
                        </Button>
                    </Link>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400"
                >
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {['🧑‍🎓', '👩‍🎓', '👨‍🎓', '🧑‍🎓'].map((emoji, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm border-2 border-[#080c14]"
                                >
                                    {emoji}
                                </div>
                            ))}
                        </div>
                        <span><strong className="text-white">2,400+</strong> students learning</span>
                    </div>

                    <div className="w-px h-4 bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-1.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span><strong className="text-white">4.9</strong>/5 average rating</span>
                    </div>

                    <div className="w-px h-4 bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span><strong className="text-white">85%</strong> students score A/B</span>
                    </div>
                </motion.div>

                {/* Hero Feature Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-4xl mx-auto"
                >
                    {[
                        {
                            icon: <Brain className="w-6 h-6 text-indigo-400" />,
                            title: 'AI Tutor',
                            desc: 'Ask anything, get step-by-step explanations in English or Tamil',
                            color: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
                        },
                        {
                            icon: <span className="text-2xl">📚</span>,
                            title: 'Full Syllabus',
                            desc: 'Every unit, topic and lesson of the Sri Lankan A/L curriculum',
                            color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
                        },
                        {
                            icon: <Trophy className="w-6 h-6 text-yellow-400" />,
                            title: 'Past Papers',
                            desc: 'Years of past papers with step-by-step marking guides',
                            color: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.03, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className={`glass rounded-2xl p-5 text-left bg-gradient-to-br ${card.color} border card-hover`}
                        >
                            <div className="mb-3">{card.icon}</div>
                            <h3 className="text-white font-semibold text-base mb-1">{card.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
