'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, PlayCircle, Lock, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getSubjectProgress } from '@/lib/progress';
import { Progress, Lesson } from '@/lib/types';
import { MasteryBadge } from '@/components/ui/MasteryBadge';

// Helper to generate some fake lessons per unit for UI demonstration
function getLessonsForUnit(unitId: string, subjectId: string): Partial<Lesson>[] {
    return [
        { id: `${unitId}-l1`, title: 'Introduction and Core Concepts', duration: 12, order: 1 },
        { id: `${unitId}-l2`, title: 'Deep Dive: Key Principles', duration: 18, order: 2 },
        { id: `${unitId}-l3`, title: 'Practice & Application', duration: 24, order: 3 },
    ];
}

export default function SubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.subjectId as string;
    const { user } = useAuth();

    const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
    const [isLoading, setIsLoading] = useState(true);

    const subject = SUBJECTS.find(s => s.id === subjectId);
    const units = (SYLLABUS as any)[subjectId] || [];

    useEffect(() => {
        if (user && subject) {
            getSubjectProgress(user.uid, subject.id)
                .then(data => {
                    setProgressMap(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load progress", err);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [user, subject]);

    if (!subject) {
        return <div className="text-white p-8">Subject not found</div>;
    }

    // Calculate overall progress
    let totalLessons = 0;
    let masteredLessons = 0;

    // Augment units with their lessons to easily calculate stats
    const unitsWithLessons = units.map((unit: any) => {
        const lessons = getLessonsForUnit(unit.id, subject.id);
        totalLessons += lessons.length;

        // Calculate unit mastery
        let unitMastered = 0;
        lessons.forEach(l => {
            const p = progressMap[l.id!];
            if (p?.status === 'mastered') {
                unitMastered++;
                masteredLessons++;
            }
        });

        const unitProgress = Math.round((unitMastered / lessons.length) * 100);

        return {
            ...unit,
            lessons,
            unitProgress,
            unitMastered
        };
    });

    const overallProgress = totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

    return (
        <div className="pb-20">
            {/* Header section with Breadcrumbs */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/dashboard/subjects" className="hover:text-white transition-colors">Subjects</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white font-medium">{subject.name}</span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                    <div className="flex items-center gap-5">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg shrink-0"
                            style={{ background: `${subject.color}15`, color: subject.color }}
                        >
                            {subject.icon}
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: subject.color }}>
                                {subject.name}
                            </h1>
                            <p className="text-slate-300 mt-2 max-w-xl text-sm leading-relaxed">
                                {subject.description}
                            </p>
                            <p className="text-slate-400 mt-3 flex items-center gap-3 text-sm font-medium">
                                <span>{subject.unitCount} Units</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                <span>{totalLessons} Lessons</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                <span>~{Math.round((totalLessons * 18) / 60)} Hours</span>
                            </p>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                        <button
                            onClick={() => router.push(`/dashboard/subjects/${subject.id}/${units[0]?.id}`)}
                            className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                        >
                            Start Learning
                        </button>
                    </div>
                </div>

                {/* Overall Progress Bar (Authenticated) */}
                {!isLoading && user && (
                    <div className="mt-8 p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-white font-bold">Overall Progress</h3>
                                <p className="text-sm text-slate-400">{masteredLessons} of {totalLessons} lessons mastered</p>
                            </div>
                            <span className="text-2xl font-black" style={{ color: subject.color }}>{overallProgress}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{ background: subject.gradient ? `linear-gradient(to right, var(--tw-gradient-stops))` : subject.color }}
                                className={`h-full rounded-full bg-gradient-to-r ${subject.gradient}`}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Units List (Accordion) */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Course Curriculum</h2>

                {unitsWithLessons.map((unit: any, i: number) => {
                    const isLocked = i > 1; // Mock: Only first 2 units are free/unlocked

                    return (
                        <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="rounded-2xl border border-white/5 bg-[#0b101a] overflow-hidden"
                        >
                            <div className="collapse collapse-arrow">
                                <input type="checkbox" className="peer" defaultChecked={i === 0} />

                                {/* Unit Header */}
                                <div className="collapse-title p-5 peer-checked:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                                            style={{ background: `${subject.color}20`, color: subject.color }}
                                        >
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                    {unit.title}
                                                </h2>
                                                {isLocked && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase tracking-widest flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
                                                {!isLocked && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-widest">Free</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5">{unit.description}</p>
                                        </div>
                                    </div>

                                    {/* Unit Progress indicator */}
                                    <div className="shrink-0 text-right hidden sm:block">
                                        <p className="text-sm font-medium text-slate-300">{unit.unitMastered}/{unit.lessons.length} Mastered</p>
                                        <div className="h-1.5 w-24 bg-slate-800 rounded-full mt-2 overflow-hidden ml-auto">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${unit.unitProgress}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                <div className="collapse-content px-5 pb-5">
                                    <div className="pt-4 border-t border-white/5 space-y-2 mt-2">
                                        {unit.lessons.map((lesson: any) => {
                                            const progress = progressMap[lesson.id];
                                            const status = progress?.status || 'not_started';

                                            return (
                                                <Link
                                                    href={isLocked ? '#' : `/dashboard/subjects/${subject.id}/${unit.id}?lesson=${lesson.id}`}
                                                    key={lesson.id}
                                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isLocked ? 'opacity-50 cursor-not-allowed border-transparent bg-transparent' : 'hover:bg-white/5 border-transparent hover:border-white/10 bg-white/[0.01]'}`}
                                                    onClick={(e) => { if (isLocked) e.preventDefault(); }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {/* Mastery Circle */}
                                                        <div className="shrink-0">
                                                            <MasteryBadge status={status} size="lg" />
                                                        </div>

                                                        <div>
                                                            <p className={`font-medium transition-colors ${isLocked ? 'text-slate-400' : 'text-slate-200 hover:text-white'}`}>
                                                                {lesson.title}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                                                                <span className="flex items-center gap-1">
                                                                    <PlayCircle className="w-3.5 h-3.5" /> Video
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                                <span>{lesson.duration} mins</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isLocked && <Lock className="w-4 h-4 text-slate-600 shrink-0" />}
                                                </Link>
                                            );
                                        })}

                                        {/* Unit Quiz Link */}
                                        <Link
                                            href={isLocked ? '#' : `/dashboard/subjects/${subject.id}/${unit.id}/quiz`}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all mt-4 relative overflow-hidden ${isLocked ? 'opacity-50 cursor-not-allowed border-transparent bg-transparent' : 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10'}`}
                                            onClick={(e) => { if (isLocked) e.preventDefault(); }}
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-3 h-3 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-indigo-400">Unit Quiz: {unit.title}</p>
                                                    <p className="text-xs text-indigo-400/70 mt-0.5">Test your mastery of this unit (15 questions)</p>
                                                </div>
                                            </div>
                                            {!isLocked && <ChevronRight className="w-5 h-5 text-indigo-400/50 relative z-10" />}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
