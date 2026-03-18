'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function DashboardSubjectsPage() {
    const { profile } = useAuth();

    // Always show all subjects here so they can add more, but highlight their enrolled ones
    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Subjects</h1>
                <p className="text-slate-400">Manage your enrolled subjects and curriculum.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {SUBJECTS.map((subject, i) => {
                    const isEnrolled = profile?.subjects.includes(subject.id);

                    return (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={`/dashboard/subjects/${subject.id}`} className="block group">
                                <Card className={`p-6 bg-black/20 border transition-all h-full ${isEnrolled ? 'border-white/10 hover:border-white/30' : 'border-white/5 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                                    }`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                                                style={{ background: `${subject.color}15`, color: subject.color }}
                                            >
                                                {subject.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-1" style={{ color: subject.color }}>{subject.name}</h2>
                                                <div className="flex gap-3 text-xs text-slate-400">
                                                    <span>{subject.unitCount} Units</span>
                                                    <span>•</span>
                                                    <span>{subject.lessonCount}+ Lessons</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isEnrolled && (
                                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-full border border-indigo-500/20">
                                                Enrolled
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {subject.description}
                                    </p>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
