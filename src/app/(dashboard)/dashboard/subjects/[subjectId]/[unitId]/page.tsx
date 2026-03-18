import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import Link from 'next/link';
import { PlayCircle, Award, Target, BookOpen } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function UnitOverviewPage({
    params
}: {
    params: Promise<{ subjectId: string; unitId: string }>;
}) {
    const { subjectId, unitId } = await params;

    const subject = SUBJECTS.find(s => s.id === subjectId);
    const units = (SYLLABUS as any)[subjectId] || [];
    const unit = units.find((u: any) => u.id === unitId);

    if (!subject || !unit) {
        return <div className="p-8 text-white">Unit not found</div>;
    }

    // Dummy lessons
    const lessons = [
        { id: `${unit.id}-l1`, title: 'Introduction and Core Concepts', duration: 12 },
        { id: `${unit.id}-l2`, title: 'Deep Dive: Key Principles', duration: 18 },
        { id: `${unit.id}-l3`, title: 'Practice & Application', duration: 24 },
    ];

    const firstLessonId = lessons[0].id;

    return (
        <div className="p-8 md:p-12 lg:p-20 max-w-4xl mx-auto h-full flex flex-col justify-center min-h-[calc(100vh-80px)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-6 w-fit border border-indigo-500/20">
                <Target className="w-4 h-4" />
                Unit Overview
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {unit.title}
            </h1>

            <p className="text-lg text-slate-300 mb-12 leading-relaxed max-w-2xl">
                Dive into {unit.title} and build a strong foundation. You will complete {lessons.length} lessons and a final unit quiz to achieve mastery.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-12">
                <div className="bg-[#0b101a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                        <PlayCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{lessons.length}</div>
                    <div className="text-sm text-slate-400">Total Lessons</div>
                </div>
                <div className="bg-[#0b101a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">1</div>
                    <div className="text-sm text-slate-400">Unit Quiz</div>
                </div>
                <div className="bg-[#0b101a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">100 XP</div>
                    <div className="text-sm text-slate-400">Completion</div>
                </div>
            </div>

            <div className="space-y-4">
                <Link
                    href={`/dashboard/subjects/${subject.id}/${unit.id}/${firstLessonId}`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] text-lg"
                >
                    <PlayCircle className="w-5 h-5 fill-white/20" />
                    Start Unit
                </Link>
            </div>
        </div>
    );
}
