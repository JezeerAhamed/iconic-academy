'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles, BrainCircuit, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
    return (
        <section className="relative min-h-[100svh] flex flex-col items-center justify-start pt-28 pb-16 overflow-hidden">
            {/* Minimalist Grid Background & Premium Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-5" />

                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/20 blur-[120px]"
                />
            </div>

            <div className="relative px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center z-10 w-full max-w-7xl mx-auto">

                {/* Trust Signal / Pill */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-3 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default"
                >
                    <div className="flex -space-x-2">
                        {['🧑‍🎓', '👩‍🎓', '👨‍🎓'].map((emoji, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-[#1a1f2e] border border-[#080c14] flex items-center justify-center text-[10px]">
                                {emoji}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 font-medium pr-2">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span>Trusted by 2,400+ A/L students</span>
                    </div>
                </motion.div>

                {/* Core Message Headline (Result Driven) */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[2.5rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[80px] font-black tracking-tight mb-6 max-w-5xl mx-auto"
                >
                    <span className="text-white">From Confused to </span>
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent block sm:inline">A Grade</span>
                    <br className="hidden sm:block" />
                    <span className="text-slate-300 text-4xl sm:text-5xl md:text-6xl lg:text-[72px] mt-2 block font-extrabold opacity-90">
                        With AI-Powered Learning
                    </span>
                </motion.h1>

                {/* Value Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                >
                    Physics. Chemistry. Biology. Combined Maths.<br className="hidden sm:block" />
                    Structured lessons, a <strong className="text-white font-medium">personal 24/7 AI tutor</strong>, and past-paper engines designed exclusively for Sri Lankan students.
                </motion.p>

                {/* High-Converting CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16 lg:mb-24"
                >
                    <Link href="/auth/signup" className="w-full sm:w-auto">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 bg-white hover:bg-slate-100 text-black border-0 font-bold text-base sm:text-lg rounded-full transition-transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                        >
                            Start Learning Free
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/subjects" className="w-full sm:w-auto">
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 bg-transparent border-white/20 text-white hover:bg-white/5 font-medium text-base sm:text-lg rounded-full transition-colors"
                        >
                            Explore Subjects
                            <ChevronRight className="w-5 h-5 ml-1 text-slate-400" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Apple-Style Glassmorphism Mockup Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 60, rotateX: 15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, type: "spring", bounce: 0.3 }}
                    style={{ perspective: 1200 }}
                    className="relative w-full max-w-5xl mx-auto hidden md:block"
                >
                    {/* The "Device" Frame */}
                    <div className="rounded-[2.5rem] border border-white/10 bg-[#060913]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex transform-gpu relative ring-1 ring-white/5 mx-4 lg:mx-0 h-[450px]">

                        {/* Top highlight glow inside the frame */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Sidebar Mockup */}
                        <div className="w-64 border-r border-white/5 p-6 bg-black/40 flex flex-col gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div className="h-4 w-24 bg-white/10 rounded-md" />
                            </div>
                            <div className="space-y-3 mt-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`h-10 rounded-xl flex items-center px-3 gap-3 ${i === 2 ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-transparent'}`}>
                                        <div className={`w-4 h-4 rounded ${i === 2 ? 'bg-indigo-400' : 'bg-white/10'}`} />
                                        <div className={`h-2 rounded-full ${i === 2 ? 'w-20 bg-indigo-400' : 'w-24 bg-white/10'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Interaction Area Mockup - The AI Chat */}
                        <div className="flex-1 p-8 bg-[url('/noise.svg')] bg-repeat opacity-[0.99] flex flex-col relative">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <BrainCircuit className="w-6 h-6 text-indigo-400" />
                                    <div className="h-4 w-32 bg-white/10 rounded-md" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10" />
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30" />
                                </div>
                            </div>

                            {/* Chat interaction */}
                            <div className="flex-1 space-y-6">
                                {/* User Message */}
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-[#1a1f2e] shrink-0 border border-white/10" />
                                    <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg rounded-tr-none max-w-[70%]">
                                        <p className="text-sm">I'm stuck on this past paper question. How do I resolve the tension components in equilibrium?</p>
                                    </div>
                                </div>

                                {/* AI Response */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                                        <BrainCircuit className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 rounded-tl-none w-[80%] shadow-lg">
                                        <p className="text-sm font-medium text-white mb-3">Great question! Let's break it down structurally:</p>

                                        <div className="space-y-2 mb-4">
                                            <div className="h-2 w-[90%] bg-white/10 rounded-full" />
                                            <div className="h-2 w-[75%] bg-white/10 rounded-full" />
                                            <div className="h-2 w-[85%] bg-white/10 rounded-full" />
                                        </div>

                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center gap-3">
                                            <Play className="w-5 h-5 text-indigo-400" />
                                            <div className="flex-1">
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full w-1/3 bg-indigo-500 rounded-full" />
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono">0:45</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Achievement Pop-in overlay mock */}
                            <div className="absolute bottom-8 right-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] backdrop-blur-md">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                <div>
                                    <div className="text-white text-sm font-bold">+50 XP Earned</div>
                                    <div className="text-xs text-emerald-400/80">Concept Mastered</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fading Edge to blend the bottom to the background */}
                    <div className="absolute inset-x-0 bottom-[-2px] h-32 bg-gradient-to-t from-[#080c14] to-transparent pointer-events-none" />
                </motion.div>

            </div>
        </section>
    );
}
