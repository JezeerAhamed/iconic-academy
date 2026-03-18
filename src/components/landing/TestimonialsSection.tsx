'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote, Award, Sparkles, CheckCircle, GraduationCap } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
    {
        name: 'Kasun Perera',
        school: 'Richmond College, Galle',
        subject: 'Physics & Maths',
        grade: 'A Grade',
        avatar: '🧑‍🎓',
        text: "ICONIC ACADEMY completely changed how I study. The AI tutor explains every Physics problem step-by-step — better than my tuition class.",
        color: '#3b82f6',
    },
    {
        name: 'Nimisha Rodrigo',
        school: 'Visakha Vidyalaya, Colombo',
        subject: 'Chemistry & Biology',
        grade: 'A Grade',
        avatar: '👩‍🎓',
        text: "The Chemistry lessons are so well-structured. Every unit has examples, practice questions, and exam tips. Past paper solutions were a game changer.",
        color: '#f97316',
    },
    {
        name: 'Arun Selvam',
        school: 'Jaffna Hindu College',
        subject: 'Combined Maths',
        grade: 'A Grade',
        avatar: '👨‍🎓',
        text: "As a Tamil-medium student, learning in Tamil from the AI tutor was incredible. The gamification kept me motivated every single day.",
        color: '#a855f7',
    },
];

const results = [
    { value: '85%', label: 'Students Score A or B', icon: <Award className="w-5 h-5 text-yellow-400" /> },
    { value: '300+', label: 'University Entries', icon: <GraduationCap className="w-5 h-5 text-indigo-400" /> },
    { value: '4.9/5', label: 'Average User Rating', icon: <Star className="w-5 h-5 text-orange-400" /> },
];

export default function TestimonialsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-medium mb-6 backdrop-blur-md cursor-default">
                        <Sparkles className="w-4 h-4" /> Trusted Excellence
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                        Proven Results. <br className="sm:hidden" />
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Real Success.</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
                        Join Sri Lanka's fastest-growing A/L community. Designed by experts, powered by AI, loved by students.
                    </p>
                </motion.div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {results.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                                {stat.icon}
                            </div>
                            <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">{stat.value}</h3>
                            <p className="text-slate-400 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Teacher Profile Card (Takes up 5 columns on desktop) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="lg:col-span-4 rounded-[2.5rem] bg-[#0b101a] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-end min-h-[450px] group"
                    >
                        {/* Background Mock Image - Using a subtle gradient/pattern to act as a placeholder for a real teacher image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-[#0b101a] z-0" />
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] z-0" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full z-0 group-hover:bg-indigo-500/30 transition-colors duration-700" />

                        <div className="relative z-10 mt-auto">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 mb:mb-6">
                                <CheckCircle className="w-3.5 h-3.5" /> Lead Educator
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">Dr. Shanindra</h3>
                            <p className="text-indigo-200/80 mb-6 font-medium">B.Sc. (Hons), Ph.D. — 10+ Years Exp.</p>

                            <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-indigo-500/50 pl-4">
                                "Our mission was to democratize premium A/L education. ICONIC ACADEMY brings Colombo's best teaching methodologies directly to your smartphone, enhanced by intelligent 24/7 AI tracking."
                            </p>
                        </div>
                    </motion.div>

                    {/* Testimonials Grid (Takes up 8 columns on desktop) */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
                                className={`rounded-[2rem] p-8 border border-white/5 transition-all duration-300 relative flex flex-col justify-between ${i === 0 ? 'bg-indigo-900/10 sm:col-span-2' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                            >
                                <Quote
                                    className="absolute top-6 right-6 w-10 h-10 opacity-5"
                                    style={{ color: t.color }}
                                />

                                <div>
                                    {/* Stars */}
                                    <div className="flex items-center gap-1 mb-6">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        ))}
                                    </div>

                                    <p className={`text-slate-300 font-light leading-relaxed mb-8 ${i === 0 ? 'text-lg sm:text-xl' : 'text-base'}`}>
                                        "{t.text}"
                                    </p>
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-4 mt-auto">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                        style={{ background: `${t.color}15`, border: `1px solid ${t.color}30` }}
                                    >
                                        {t.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-semibold">{t.name}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">{t.school}</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <span
                                            className="text-xs font-bold px-3 py-1.5 rounded-full"
                                            style={{ background: `${t.color}15`, color: t.color }}
                                        >
                                            {t.grade}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
