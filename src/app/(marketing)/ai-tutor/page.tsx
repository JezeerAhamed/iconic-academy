'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, MessageSquare, Zap, Target, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AITutorPage() {
    return (
        <div className="min-h-screen pt-32 pb-24 relative overflow-hidden grid-bg">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium text-sm mb-6 uppercase tracking-widest"
                    >
                        <BrainCircuit className="w-4 h-4" /> Your 24/7 Personal Teacher
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight"
                    >
                        Meet the Most Advanced <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">AI Tutor for A/Ls</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto mb-10"
                    >
                        Stuck on a Physics problem at 2 AM? Our Socratic AI Tutor breaks down complex Chemistry, Biology, Physics, and Maths concepts step-by-step until you truly understand.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link href="/auth/signup">
                            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 mx-auto">
                                Chat With AI Tutor Now <MessageSquare className="w-5 h-5" />
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                    <FeatureCard
                        icon={<MessageSquare className="w-6 h-6 text-indigo-400" />}
                        title="Socratic Method"
                        description="It doesn't just give you the answer. It asks guiding questions to help you arrive at the solution yourself, building true exam confidence."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-orange-400" />}
                        title="Analogy-First Explanations"
                        description="Struggling with Quantum Mechanics? The AI explains complex topics using real-world analogies that make sense to Sri Lankan students."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<Clock className="w-6 h-6 text-emerald-400" />}
                        title="Available 24/7"
                        description="No more waiting for the next class. Your personal tutor is in your pocket, ready to explain concepts anytime, anywhere."
                        delay={0.3}
                    />
                </div>

                {/* Demo Mockup */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <div className="rounded-2xl border border-white/10 bg-[#0b101a] shadow-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">Iconic AI Tutor - Physics</span>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex justify-end">
                                <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                                    I don't understand Bernoulli's principle. Can you explain?
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-white/10 text-white px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
                                    I'd love to help! Let's think about a real-world scenario. Have you ever stood near a fast-moving train and felt like you were being pulled towards it? 🚂
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                                    Yes! It feels like a suction.
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-white/10 text-white px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] text-sm border border-indigo-500/30">
                                    Exactly! That's Bernoulli's principle in action. As the speed of a fluid (in this case, air) increases, its pressure decreases. The high-speed train creates a low-pressure zone next to it, and the higher normal air pressure behind you pushes you towards the train. <br /><br />Now, how do you think this applies to an airplane wing? ✈️
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="p-8 rounded-2xl bg-[#0b101a] border border-white/5 hover:border-indigo-500/30 transition-colors group"
        >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}
