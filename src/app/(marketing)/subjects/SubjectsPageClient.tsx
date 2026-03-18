'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Trophy, Star, Zap } from 'lucide-react';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

export default function SubjectsPageClient() {
    return (
        <div className="min-h-screen pt-28 pb-20 hero-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-6">
                        <Zap className="w-4 h-4" />
                        Full Sri Lankan A/L Curriculum
                    </span>
                    <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 tracking-tight">
                        Choose Your <span className="gradient-text">Subject</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Every unit. Every topic. Every lesson — built for A/L mastery with AI-powered guidance and past papers.
                    </p>
                </motion.div>

                {/* Subject Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {SUBJECTS.map((subject, i) => {
                        const units = SYLLABUS[subject.id as keyof typeof SYLLABUS] || [];

                        return (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <Link href={`/subjects/${subject.id}`} className="block group">
                                    <div
                                        className="relative rounded-3xl overflow-hidden glass border transition-all duration-500 cursor-pointer"
                                        style={{ borderColor: `${subject.color}20` }}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.borderColor = `${subject.color}45`;
                                            el.style.transform = 'translateY(-6px)';
                                            el.style.boxShadow = `0 30px 60px ${subject.color}18`;
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.borderColor = `${subject.color}20`;
                                            el.style.transform = 'translateY(0px)';
                                            el.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Top color band */}
                                        <div
                                            className="h-1.5 w-full"
                                            style={{ background: `linear-gradient(90deg, ${subject.color}, ${subject.colorLight})` }}
                                        />

                                        {/* Background glow */}
                                        <div
                                            className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500 -translate-y-1/3 translate-x-1/3 pointer-events-none"
                                            style={{ background: subject.color }}
                                        />

                                        <div className="p-8 relative">
                                            {/* Header Row */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl"
                                                        style={{
                                                            background: `${subject.color}15`,
                                                            border: `1.5px solid ${subject.color}30`,
                                                            boxShadow: `0 8px 24px ${subject.color}20`,
                                                        }}
                                                    >
                                                        {subject.icon}
                                                    </div>
                                                    <div>
                                                        <h2
                                                            className="text-2xl font-black tracking-tight"
                                                            style={{ color: subject.color }}
                                                        >
                                                            {subject.name}
                                                        </h2>
                                                        <p className="text-slate-400 text-sm mt-0.5">{subject.description.slice(0, 60)}...</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                {[
                                                    { icon: <BookOpen className="w-4 h-4" />, value: `${subject.unitCount}`, label: 'Units' },
                                                    { icon: <Trophy className="w-4 h-4" />, value: `${subject.lessonCount}+`, label: 'Lessons' },
                                                    { icon: <Clock className="w-4 h-4" />, value: '120+', label: 'Hours' },
                                                ].map((stat, j) => (
                                                    <div
                                                        key={j}
                                                        className="rounded-xl p-3 text-center"
                                                        style={{ background: `${subject.color}10` }}
                                                    >
                                                        <div className="flex justify-center mb-1" style={{ color: subject.color }}>{stat.icon}</div>
                                                        <div className="text-white font-bold text-lg leading-none">{stat.value}</div>
                                                        <div className="text-slate-400 text-xs mt-0.5">{stat.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Units List */}
                                            <div className="mb-6">
                                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Syllabus Units</p>
                                                <div className="space-y-2">
                                                    {units.slice(0, 5).map((unit, j) => (
                                                        <div key={unit.id} className="flex items-center gap-3">
                                                            <div
                                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                                                style={{ background: `${subject.color}20`, color: subject.color }}
                                                            >
                                                                {j + 1}
                                                            </div>
                                                            <span className="text-slate-300 text-sm">{unit.title}</span>
                                                            {j < 2 && (
                                                                <Badge
                                                                    className="ml-auto text-[10px] py-0"
                                                                    style={{ background: `${subject.color}15`, color: subject.color, border: `1px solid ${subject.color}20` }}
                                                                >
                                                                    Free
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {units.length > 5 && (
                                                        <p className="text-slate-500 text-xs pl-9">
                                                            + {units.length - 5} more units included
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CTA Row */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                    <span className="ml-1">4.9 · 400+ students</span>
                                                </div>

                                                <div
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group-hover:gap-3"
                                                    style={{
                                                        background: `${subject.color}20`,
                                                        color: subject.color,
                                                        border: `1px solid ${subject.color}30`,
                                                    }}
                                                >
                                                    Start Learning
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
