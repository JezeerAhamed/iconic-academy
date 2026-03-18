'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Kasun Perera',
        school: 'Richmond College, Galle',
        subject: 'Physics & Maths',
        grade: 'A Grade',
        avatar: '🧑‍🎓',
        text: "ICONIC ACADEMY completely changed how I study. The AI tutor explains every Physics problem step-by-step — better than my tuition class. I went from a C to an A in 3 months!",
        color: '#3b82f6',
    },
    {
        name: 'Nimisha Rodrigo',
        school: 'Visakha Vidyalaya, Colombo',
        subject: 'Chemistry & Biology',
        grade: 'A Grade',
        avatar: '👩‍🎓',
        text: "The Chemistry lessons are so well-structured. Every unit has examples, practice questions, and exam tips. Past paper solutions with marking schemes were a game changer.",
        color: '#f97316',
    },
    {
        name: 'Arun Selvam',
        school: 'Jaffna Hindu College',
        subject: 'Combined Maths',
        grade: 'A Grade',
        avatar: '👨‍🎓',
        text: "As a Tamil-medium student, learning in Tamil from the AI tutor was incredible. The math solutions are detailed and the gamification kept me motivated every single day.",
        color: '#a855f7',
    },
    {
        name: 'Dilhara Jayawardena',
        school: 'Ananda College, Colombo',
        subject: 'Biology',
        grade: 'S Grade → A Grade',
        avatar: '🧑‍🎓',
        text: "My Biology results improved drastically. The weak area detection told me exactly where I was failing, and the AI tutor fixed my understanding unit by unit.",
        color: '#22c55e',
    },
];

export default function TestimonialsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="section-pad">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass border border-white/10 text-indigo-400 text-sm font-medium mb-4">
                        🏅 Student Success Stories
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                        Results That <span className="gradient-text">Speak</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Thousands of A/L students across Sri Lanka have transformed their grades with ICONIC ACADEMY.
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 relative"
                        >
                            <Quote
                                className="absolute top-5 right-5 w-8 h-8 opacity-10"
                                style={{ color: t.color }}
                            />

                            {/* Stars */}
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            <p className="text-slate-300 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                                    style={{ background: `${t.color}15`, border: `1px solid ${t.color}30` }}
                                >
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{t.name}</p>
                                    <p className="text-slate-500 text-xs">{t.school}</p>
                                </div>
                                <div className="ml-auto">
                                    <span
                                        className="text-xs font-bold px-2.5 py-1 rounded-full"
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
        </section>
    );
}
