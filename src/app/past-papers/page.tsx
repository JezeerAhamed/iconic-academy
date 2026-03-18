'use client';

import { motion } from 'framer-motion';
import { Target, FileText, CheckCircle2, TrendingUp, Filter, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function PastPapersPage() {
    return (
        <div className="min-h-screen pt-32 pb-24 relative overflow-hidden grid-bg">
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm mb-6 uppercase tracking-widest"
                        >
                            <Target className="w-4 h-4" /> The Ultimate Question Bank
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight"
                        >
                            Train Like the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Island Rankers</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-400 mb-10"
                        >
                            Access 20+ years of categorized A/L past papers. Practice MCQs with instant feedback, write structured essays, and compare your answers with official marking schemes and AI-generated model answers.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <Link href="/auth/signup">
                                <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all">
                                    Start Practicing Free
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-lg transition-all">
                                    View Plans
                                </button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Feature Highlight Graphic */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
                        <div className="relative bg-[#0b101a] border border-white/10 rounded-3xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">2020 Physics Paper</h4>
                                        <p className="text-xs text-slate-400">MCQ • Mechanics</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase">Time: 12:45</span>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-sm text-slate-300 mb-4">
                                        15. A uniform solid sphere of mass M and radius R rolls without slipping down an inclined plane...
                                    </p>
                                    <div className="space-y-2">
                                        {['(1) 2/5 MR²', '(2) 5/7 gsinθ', '(3) Exact model answer'].map((opt, i) => (
                                            <div key={i} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${i === 1 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'border-white/5 bg-black/20 text-slate-400'}`}>
                                                <span>{opt}</span>
                                                {i === 1 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 border-y border-white/5 py-12">
                    <StatBox label="Questions Bank" value="15,000+" icon={<Target className="w-5 h-5 text-indigo-400" />} />
                    <StatBox label="Years Covered" value="1995-2023" icon={<Clock className="w-5 h-5 text-orange-400" />} />
                    <StatBox label="Students Active" value="12,400+" icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} />
                    <StatBox label="Video Solutions" value="8,500+" icon={<PlayCircle className="w-5 h-5 text-purple-400" />} />
                </div>

            </div>
        </div>
    );
}

function StatBox({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
                {icon}
            </div>
            <h3 className="text-3xl font-black text-white mb-2">{value}</h3>
            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
        </div>
    );
}
