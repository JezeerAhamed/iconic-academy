'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, PlayCircle, CheckCircle2, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Unit {
    id: string;
    title: string;
    description: string;
}

export default function SubjectClientPage({
    subjectData,
    syllabus,
}: {
    subjectData: Subject;
    syllabus: Unit[];
}) {
    const { user, profile } = useAuth();
    const router = useRouter();

    const isPremium = profile?.plan === 'pro' || profile?.plan === 'elite';

    const handleUnitClick = (index: number) => {
        if (!user) {
            router.push('/auth/signup');
            return;
        }

        const isFreeUnit = index < 2;

        if (isPremium || isFreeUnit) {
            // Free unit or paid user -> go to learning dashboard
            router.push('/dashboard/subjects');
        } else {
            // Locked unit & free user -> go to pricing
            router.push('/pricing');
        }
    };

    return (
        <div className="min-h-screen bg-[#080c14] pb-20">
            {/* Hero Section */}
            <div className={`relative pt-32 pb-20 bg-gradient-to-br ${subjectData.bgGradient} border-b border-white/5`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                                style={{ backgroundColor: `${subjectData.color}20`, border: `1px solid ${subjectData.color}40` }}>
                                {subjectData.icon}
                            </div>
                            <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                                A/L Syllabus
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                            {subjectData.name}
                        </h1>
                        <p className="text-lg text-slate-300 md:text-xl leading-relaxed mb-8 max-w-2xl">
                            {subjectData.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 text-slate-300">
                                <BookOpen className="w-5 h-5 text-indigo-400" />
                                <span className="font-semibold text-white">{subjectData.unitCount}</span> Units
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <PlayCircle className="w-5 h-5 text-indigo-400" />
                                <span className="font-semibold text-white">{subjectData.lessonCount}</span> Lessons
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                <span className="font-semibold text-white">Interactive Quizzes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[100%] rounded-full opacity-10 blur-3xl"
                        style={{ backgroundColor: subjectData.color }}></div>
                </div>
            </div>

            {/* Syllabus Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Course Curriculum</h2>
                    <p className="text-slate-400">Master the entire {subjectData.name} syllabus unit by unit. First two units are completely free to try.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {syllabus.map((unit, index) => {
                        const isFreeUnit = index < 2;
                        const isLocked = !isPremium && !isFreeUnit;

                        return (
                            <motion.div
                                key={unit.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card
                                    onClick={() => handleUnitClick(index)}
                                    className={`relative h-full p-6 cursor-pointer transition-all duration-300 group ${isLocked
                                            ? 'bg-[#0a0f1a]/80 border-white/5 hover:border-white/10'
                                            : 'bg-[#0f1623] border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)]'
                                        }`}
                                >
                                    {/* Top Bar: Badge & Icon */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                                            <span className="text-lg font-bold text-slate-300 group-hover:text-indigo-400">U{index + 1}</span>
                                        </div>
                                        {isFreeUnit ? (
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                Free Preview
                                            </Badge>
                                        ) : isPremium ? (
                                            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                                                Unlocked
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-black/50 text-slate-400 border-white/10 flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Locked
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={isLocked ? 'opacity-75 group-hover:opacity-100 transition-opacity' : ''}>
                                        <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                                            {unit.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                            {unit.description}
                                        </p>
                                    </div>

                                    {/* Bottom Info */}
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-auto pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <PlayCircle className="w-4 h-4" />
                                            <span>~8 Lessons</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>~4 Hours</span>
                                        </div>
                                    </div>

                                    {/* Hover Overlay for Locked items */}
                                    {isLocked && !user && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                                Sign In to Enroll
                                            </div>
                                        </div>
                                    )}
                                    {isLocked && user && !isPremium && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                                <Lock className="w-4 h-4" /> Unlock Premium
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* CTA Action Bar */}
                {!isPremium && (
                    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Ready to master the full syllabus?</h3>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                            Get unlimited access to all {subjectData.unitCount} units, including HD video derivations, AI grading, and 24/7 tutor support.
                        </p>
                        <Button
                            onClick={() => router.push('/pricing')}
                            className="bg-white text-black hover:bg-slate-200 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            View Premium Plans
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
