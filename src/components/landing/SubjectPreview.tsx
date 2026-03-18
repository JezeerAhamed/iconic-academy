'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Lock } from 'lucide-react';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function SubjectPreview() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="section-pad">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass border border-white/10 text-indigo-400 text-sm font-medium mb-4">
                        📚 Full Sri Lankan A/L Syllabus
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                        Choose Your <span className="gradient-text">Subject</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Every unit. Every topic. Every lesson — structured for the A/L exam with AI-powered guidance.
                    </p>
                </motion.div>

                {/* Subject Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SUBJECTS.map((subject, i) => {
                        const units = SYLLABUS[subject.id as keyof typeof SYLLABUS] || [];

                        return (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <Link href={`/subjects/${subject.id}`}>
                                    <div
                                        className={cn(
                                            'group relative rounded-2xl p-6 glass border card-hover cursor-pointer overflow-hidden',
                                            'hover:border-opacity-50 transition-all duration-300'
                                        )}
                                        style={{
                                            borderColor: `${subject.color}20`,
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = `${subject.color}40`;
                                            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${subject.color}18`;
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = `${subject.color}20`;
                                            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Background glow */}
                                        <div
                                            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"
                                            style={{ background: subject.color }}
                                        />

                                        <div className="relative">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                        style={{ background: `${subject.color}15`, border: `1px solid ${subject.color}30` }}
                                                    >
                                                        {subject.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold text-lg tracking-tight">{subject.name}</h3>
                                                        <p className="text-slate-400 text-xs">{subject.unitCount} Units · {subject.lessonCount}+ Lessons</p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                                    style={{ background: `${subject.color}15`, color: subject.color }}
                                                >
                                                    <BookOpen className="w-3 h-3" />
                                                    Full Syllabus
                                                </div>
                                            </div>

                                            <p className="text-slate-400 text-sm mb-5 leading-relaxed">{subject.description}</p>

                                            {/* Unit Preview */}
                                            <div className="space-y-1.5 mb-5">
                                                {units.slice(0, 4).map((unit, j) => (
                                                    <div key={unit.id} className="flex items-center gap-2.5 text-xs text-slate-400">
                                                        <div
                                                            className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                                                            style={{ background: `${subject.color}15`, color: subject.color }}
                                                        >
                                                            {j + 1}
                                                        </div>
                                                        <span className="truncate">{unit.title}</span>
                                                    </div>
                                                ))}
                                                {units.length > 4 && (
                                                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                                                        <div className="w-5 h-5 rounded-md flex items-center justify-center">
                                                            <Lock className="w-3 h-3" />
                                                        </div>
                                                        <span>+{units.length - 4} more units</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTA */}
                                            <div
                                                className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-200"
                                                style={{ color: subject.color }}
                                            >
                                                Start Learning
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
