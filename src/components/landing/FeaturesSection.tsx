'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
    Brain, BookOpen, Trophy, Target,
    TrendingUp, Mic, Globe, Zap
} from 'lucide-react';

const features = [
    {
        icon: <Brain className="w-6 h-6" />,
        title: 'AI Tutor',
        description: 'Context-aware AI that understands the Sri Lankan A/L syllabus. Get step-by-step solutions in English or Tamil — 24/7.',
        color: '#6366f1',
        tag: 'Core Feature',
    },
    {
        icon: <BookOpen className="w-6 h-6" />,
        title: 'Full Syllabus Coverage',
        description: 'Every unit, topic and lesson of Physics, Chemistry, Biology & Combined Maths — exactly as per the Sri Lankan A/L curriculum.',
        color: '#3b82f6',
        tag: '400+ Lessons',
    },
    {
        icon: <Trophy className="w-6 h-6" />,
        title: 'Past Paper Engine',
        description: 'Filter by subject, unit and year. Get step-by-step solutions, marking guide logic, and examiner insights for every question.',
        color: '#f59e0b',
        tag: 'Exam Ready',
    },
    {
        icon: <Target className="w-6 h-6" />,
        title: 'Smart Practice',
        description: 'MCQs, structured and essay questions with instant feedback. Track accuracy, speed, and topic mastery in real-time.',
        color: '#22c55e',
        tag: 'Adaptive',
    },
    {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Weak Area Detection',
        description: 'Our AI engine analyzes your performance to pinpoint weak topics and auto-generates a personalized revision plan.',
        color: '#f97316',
        tag: 'AI-Powered',
    },
    {
        icon: <Mic className="w-6 h-6" />,
        title: 'Voice AI Tutoring',
        description: 'Speak your question, hear the explanation. Voice-to-text and text-to-speech for a hands-free learning experience.',
        color: '#a855f7',
        tag: 'Elite Only',
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: 'Bilingual Support',
        description: 'Learn in English or Tamil. Our AI tutor responds fluently in the language you prefer — fully bilingual platform.',
        color: '#ec4899',
        tag: 'Tamil + English',
    },
    {
        icon: <Zap className="w-6 h-6" />,
        title: 'Gamified Learning',
        description: 'Earn XP, level up from Beginner to Ranker, maintain daily streaks, and unlock achievement badges as you progress.',
        color: '#eab308',
        tag: 'Engagement',
    },
];

export default function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="section-pad bg-[#060a11]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass border border-white/10 text-indigo-400 text-sm font-medium mb-4">
                        ⚡ Built Different
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                        Everything You Need to <span className="gradient-text">Score an A</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Not just video lessons — a complete AI-powered learning system that adapts to your needs.
                    </p>
                </motion.div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.07 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-default group"
                        >
                            {/* Icon */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                                style={{ background: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}25` }}
                            >
                                {feature.icon}
                            </div>

                            {/* Tag */}
                            <span
                                className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mb-3"
                                style={{ background: `${feature.color}15`, color: feature.color }}
                            >
                                {feature.tag}
                            </span>

                            <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
