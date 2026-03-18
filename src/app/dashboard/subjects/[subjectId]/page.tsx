'use client';

import { useParams } from 'next/navigation';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, PlayCircle, Lock, BookOpen } from 'lucide-react';

export default function SubjectDetailPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;

    const subject = SUBJECTS.find(s => s.id === subjectId);
    const units = (SYLLABUS as any)[subjectId] || [];

    if (!subject) {
        return <div className="text-white">Subject not found</div>;
    }

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard/subjects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" /> Back to Subjects
                </Link>

                <div className="flex items-center gap-5">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                        style={{ background: `${subject.color}15`, color: subject.color }}
                    >
                        {subject.icon}
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: subject.color }}>
                            {subject.name}
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-3">
                            <span>{subject.unitCount} Units</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <span>{subject.lessonCount}+ Lessons</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <span>0% Completed</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Curriculum / Units List */}
            <div className="space-y-6">
                {units.map((unit: any, i: number) => (
                    <motion.div
                        key={unit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl border border-white/5 bg-black/20 overflow-hidden"
                    >
                        {/* Unit Header */}
                        <div className="p-5 sm:p-6 border-b border-white/5 bg-[#0b101a] flex justify-between items-center group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                                    style={{ background: `${subject.color}20`, color: subject.color }}
                                >
                                    {i + 1}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {unit.title}
                                    </h2>
                                    <p className="text-sm text-slate-500">{unit.topics?.length || 0} Topics</p>
                                </div>
                            </div>
                        </div>

                        {/* Topics List */}
                        <div className="p-2 sm:p-4 space-y-2">
                            {unit.topics?.map((topic: any, j: number) => (
                                <div key={topic.id} className="collapse collapse-arrow rounded-xl border border-white/5 bg-transparent hover:bg-white/[0.02] transition-colors">
                                    <input type="checkbox" className="peer" defaultChecked={i === 0 && j === 0} />
                                    <div className="collapse-title flex items-center gap-3 text-slate-200 peer-checked:text-white font-medium">
                                        <BookOpen className="w-4 h-4 text-slate-500" />
                                        {topic.title}
                                    </div>

                                    <div className="collapse-content">
                                        <div className="pt-2 pl-7 space-y-2">
                                            {/* Fake lessons mapping since topics don't have lessons array in constants yet */}
                                            {[1, 2].map((lessonNum) => (
                                                <Link
                                                    href={`/dashboard/subjects/${subject.id}/lessons/${topic.id}-l${lessonNum}`}
                                                    key={lessonNum}
                                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <PlayCircle className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                                                        <div>
                                                            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                                                Lesson {lessonNum}: Introduction to {topic.title}
                                                            </p>
                                                            <div className="flex gap-2 text-[10px] text-slate-500 mt-1 font-medium">
                                                                <span className="px-2 py-0.5 rounded bg-white/5">Video</span>
                                                                <span className="px-2 py-0.5 rounded bg-white/5">12 mins</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Access Control (Mock: Free for first unit, otherwise locked/completed) */}
                                                    {i === 0 ? (
                                                        <CheckCircle2 className="w-5 h-5 text-slate-600" />
                                                    ) : (
                                                        <Lock className="w-4 h-4 text-slate-600" />
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
