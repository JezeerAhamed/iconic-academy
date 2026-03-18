'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Subject, Progress } from '@/lib/types';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle } from 'lucide-react';

export default function DashboardSubjectsPage() {
    const { profile } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!profile?.uid) return;

            try {
                // Fetch all subjects from Firestore
                const subjectsSnap = await getDocs(collection(db, 'subjects'));
                const fetchedSubjects = subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
                setSubjects(fetchedSubjects);

                // Fetch student progress to calculate completion percentages
                const progressQ = query(collection(db, 'studentProgress'), where('userId', '==', profile.uid));
                const progressSnap = await getDocs(progressQ);

                const pMap: Record<string, number> = {};
                progressSnap.docs.forEach(doc => {
                    const data = doc.data() as Progress;
                    if (data.status === 'mastered' || data.status === 'completed' as any) {
                        pMap[data.subjectId] = (pMap[data.subjectId] || 0) + 1;
                    }
                });
                setProgressMap(pMap);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [profile?.uid]);

    if (loading) {
        return (
            <div className="space-y-8 pb-12">
                <div>
                    <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-3" />
                    <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(n => (
                        <Card key={n} className="p-6 bg-white/5 border-white/5 h-48 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="w-16 h-16 text-slate-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Subjects Found</h2>
                <p className="text-slate-400">Subjects haven't been added to the database yet. Check back later!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Subjects</h1>
                <p className="text-slate-400">Manage your enrolled subjects and track your exact progress.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {subjects.map((subject, i) => {
                    const isEnrolled = profile?.subjects.includes(subject.id);
                    const completedLessons = progressMap[subject.id] || 0;
                    const totalLessons = subject.lessonCount || 1;
                    const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

                    // Use lastVisitedLesson if it specifically belongs to this subject.
                    // If complex, we just link to the first unit of the subject for now.
                    // Optional: link directly to lesson if stored globally
                    const targetLink = `/dashboard/subjects/${subject.id}`;

                    return (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={targetLink} className="block group h-full">
                                <Card className={`p-6 bg-black/20 border transition-all h-full ${isEnrolled ? 'border-white/10 hover:border-white/30' : 'border-white/5 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                                                style={{ background: `${subject.color || '#4f46e5'}15`, color: subject.color || '#4f46e5' }}
                                            >
                                                {subject.icon || '📚'}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-1" style={{ color: subject.color || '#fff' }}>{subject.name}</h2>
                                                <div className="flex gap-3 text-xs text-slate-400">
                                                    <span>{subject.unitCount || 0} Units</span>
                                                    <span>•</span>
                                                    <span>{subject.lessonCount || 0}+ Lessons</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isEnrolled ? (
                                        <div className="mt-6 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Progress</span>
                                                <span className="text-white font-bold">{progressPercent}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%`, backgroundColor: subject.color || '#4f46e5' }} />
                                            </div>
                                            <div className="pt-2">
                                                <div className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                                    {progressPercent > 0 ? (
                                                        <>Continue Learning <PlayCircle className="w-4 h-4" /></>
                                                    ) : (
                                                        <>Start Learning <PlayCircle className="w-4 h-4" /></>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-6">
                                            <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/5 text-sm font-medium text-slate-300 group-hover:bg-white/10 transition-colors">
                                                View Syllabus
                                            </span>
                                        </div>
                                    )}
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
