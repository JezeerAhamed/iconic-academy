'use client';

import { use, useEffect, useState } from 'react';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUnitProgress } from '@/lib/progress';
import { Progress, Lesson } from '@/lib/types';
import { MasteryBadge } from '@/components/ui/MasteryBadge';

export default function UnitLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subjectId: string; unitId: string }>;
}) {
    const unwrappedParams = use(params);
    const subjectId = unwrappedParams.subjectId;
    const unitId = unwrappedParams.unitId;

    const pathname = usePathname();
    const { user } = useAuth();
    const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});

    const subject = SUBJECTS.find(s => s.id === subjectId);
    const units = (SYLLABUS as any)[subjectId] || [];
    const unit = units.find((u: any) => u.id === unitId);

    useEffect(() => {
        if (user && unit) {
            getUnitProgress(user.uid, unit.id).then(setProgressMap).catch(console.error);
        }
    }, [user, unit]);

    if (!subject || !unit) {
        return <div className="p-8 text-white">Unit not found</div>;
    }

    // Generate fake lessons
    const lessons = [
        { id: `${unitId}-l1`, title: 'Introduction and Core Concepts', duration: 12 },
        { id: `${unitId}-l2`, title: 'Deep Dive: Key Principles', duration: 18 },
        { id: `${unitId}-l3`, title: 'Practice & Application', duration: 24 },
    ];

    let masteredCount = 0;
    lessons.forEach(l => {
        if (progressMap[l.id]?.status === 'mastered') masteredCount++;
    });
    const unitProgress = Math.round((masteredCount / lessons.length) * 100);

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-black">
            {/* Left Panel - Lesson Navigation */}
            <div className="w-full md:w-[35%] lg:w-[30%] border-r border-white/5 bg-[#0b101a] flex flex-col h-full md:sticky md:top-[80px] md:h-[calc(100vh-80px)] md:overflow-y-auto hidden-scrollbar">
                {/* Breadcrumbs & Header */}
                <div className="p-5 border-b border-white/5">
                    <Link
                        href={`/dashboard/subjects/${subject.id}`}
                        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to {subject.name}
                    </Link>

                    <h2 className="text-xl font-bold text-white mb-2">{unit.title}</h2>

                    {/* Unit Progress */}
                    <div className="flex items-center justify-between text-sm mb-2 mt-4">
                        <span className="text-slate-400">Mastery</span>
                        <span className="text-white font-medium">{masteredCount}/{lessons.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${unitProgress}%` }} />
                    </div>
                </div>

                {/* Lessons List */}
                <div className="flex-1 p-3 space-y-1">
                    {lessons.map((lesson, idx) => {
                        const isActive = pathname.includes(`/${lesson.id}`);
                        const status = progressMap[lesson.id]?.status || 'not_started';

                        return (
                            <Link
                                key={lesson.id}
                                href={`/dashboard/subjects/${subject.id}/${unit.id}/${lesson.id}`}
                                className={`flex items-start gap-3 p-3 rounded-xl transition-colors group cursor-pointer ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                <div className="mt-0.5 shrink-0">
                                    <MasteryBadge status={status} size="md" />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-medium transition-colors leading-tight mb-1 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {idx + 1}. {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                                        <PlayCircle className="w-3 h-3" />
                                        {lesson.duration}m
                                    </div>
                                </div>
                            </Link>
                        )
                    })}

                    <div className="my-4 border-t border-white/5" />

                    {/* Unit Quiz Link */}
                    <Link
                        href={`/dashboard/subjects/${subject.id}/${unit.id}/quiz`}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors group cursor-pointer border mt-2 ${pathname.includes('/quiz') ? 'bg-indigo-500/10 border-indigo-500/40' : 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10'}`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">Unit Quiz</h4>
                            <p className="text-xs text-indigo-400/70">Test your mastery</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Right Panel - Content Area */}
            <div className="flex-1 bg-black">
                {children}
            </div>
        </div>
    );
}
