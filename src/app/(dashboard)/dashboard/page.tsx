'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Progress, Subject } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Clock, BrainCircuit, Target, ArrowRight, Zap, BookOpen, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getLevelProgress } from '@/lib/gamification';
import toast from 'react-hot-toast';

export default function DashboardOverview() {
    const { user, profile } = useAuth();

    // Data states
    const [progressStats, setProgressStats] = useState({
        totalLessons: 0,
        averageAccuracy: 0,
        subjectProgress: {} as Record<string, number>,
        lastSubjectId: ''
    });
    const [dailyGoalXP, setDailyGoalXP] = useState(100);
    const [savingGoal, setSavingGoal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            if (!profile?.uid) return;

            try {
                // Fetch student progress
                const progressQ = query(collection(db, 'studentProgress'), where('userId', '==', profile.uid));
                const progressSnap = await getDocs(progressQ);

                let totalCompleted = 0;
                let totalAccuracy = 0;
                let accuracyCount = 0;
                const pMap: Record<string, number> = {};
                let latestDate = 0;
                let lastSubject = '';

                progressSnap.docs.forEach(doc => {
                    const data = doc.data() as Progress;
                    const isCompleted = data.status === 'mastered' || (data.status as any) === 'completed';

                    if (isCompleted) {
                        totalCompleted++;
                        pMap[data.subjectId] = (pMap[data.subjectId] || 0) + 1;
                    }

                    if (data.accuracy !== undefined) {
                        totalAccuracy += data.accuracy;
                        accuracyCount++;
                    }

                    const attemptTime = new Date(data.lastAttemptAt || 0).getTime();
                    if (attemptTime > latestDate) {
                        latestDate = attemptTime;
                        lastSubject = data.subjectId;
                    }
                });

                setProgressStats({
                    totalLessons: totalCompleted,
                    averageAccuracy: accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0,
                    subjectProgress: pMap,
                    lastSubjectId: lastSubject
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [profile?.uid]);

    // Fetch current daily goal from gamification doc on load
    useEffect(() => {
        async function fetchGoal() {
            if (!user?.uid) return;
            const gamSnap = await getDoc(doc(db, 'gamification', user.uid));
            if (gamSnap.exists()) {
                setDailyGoalXP(gamSnap.data().dailyGoalXP ?? 100);
            }
        }
        fetchGoal();
    }, [user?.uid]);

    const handleSetGoal = async (xp: number) => {
        if (!user?.uid) return;
        setSavingGoal(true);
        try {
            await updateDoc(doc(db, 'gamification', user.uid), { dailyGoalXP: xp });
            setDailyGoalXP(xp);
            toast.success(`Daily goal set to ${xp} XP! 🎯`);
        } catch {
            toast.error('Could not save goal. Please retry.');
        } finally {
            setSavingGoal(false);
        }
    };

    // Process Gamification Data
    const progressData = getLevelProgress(profile?.xp || 0, profile?.level || 'Beginner');

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const userSubjects = SUBJECTS.filter(s => (profile?.enrolledSubjects ?? []).includes(s.id));
    const continueLink = progressStats.lastSubjectId
        ? `/dashboard/subjects/${progressStats.lastSubjectId}`
        : userSubjects.length > 0 ? `/dashboard/subjects/${userSubjects[0].id}` : `/dashboard/subjects`;

    // Find the first lesson of the first enrolled subject for empty-state CTA
    const firstSubject = userSubjects[0];
    const firstSubjectUnits = firstSubject ? (SYLLABUS as any)[firstSubject.id] ?? [] : [];
    const firstUnit = firstSubjectUnits[0];
    const firstLesson = firstUnit?.lessons?.[0];
    const firstLessonLink = firstSubject && firstUnit && firstLesson
        ? `/dashboard/subjects/${firstSubject.id}/${firstUnit.id}/${firstLesson.id}`
        : `/dashboard/subjects`;

    const isNewUser = !loading && progressStats.totalLessons === 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {greeting}, <span className="text-indigo-400">{profile?.displayName?.split(' ')[0] || 'Student'}</span>! 👋
                    </h1>
                    <p className="text-slate-400">Ready to crush your A/L {profile?.examYear} goals today?</p>
                </div>
            </div>

            {/* Gamification Dashboard Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Progress Card */}
                <Card className="p-6 col-span-1 lg:col-span-2 bg-[#0b101a] border-white/10 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">

                        {/* Level Shield */}
                        <div className="relative flex shrink-0 items-center justify-center w-36 h-36">
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-pulse" />
                            <div className="w-28 h-28 rounded-full bg-[#1a1f2e] border border-indigo-500/50 flex flex-col items-center justify-center z-10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">Level</span>
                                <span className="text-4xl font-black text-white">{Math.floor((profile?.xp || 0) / 1000) + 1}</span>
                            </div>
                            {/* Circular Progress Ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="72" cy="72" r="66" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                <circle cx="72" cy="72" r="66" fill="none" stroke="currentColor" strokeWidth="6"
                                    className="text-indigo-500 transition-all duration-1000 ease-out"
                                    strokeDasharray="414"
                                    strokeDashoffset={414 - (414 * progressData.percentage) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        {/* XP Details */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                                <Trophy className="w-3.5 h-3.5" /> {profile?.level || 'Beginner'} Rank
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                Level up your knowledge! 🚀
                            </h3>
                            <p className="text-slate-400 mb-6 text-sm max-w-md">
                                You are <strong className="text-white">{progressData.requiredXP - progressData.currentXPInLevel} XP</strong> away from reaching the next rank. Keep crushing those lessons!
                            </p>

                            {/* Quick Stats Grid */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-8">
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-widest">Total XP</p>
                                    <p className="text-xl font-bold text-indigo-400">{profile?.xp || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-widest">Lessons</p>
                                    <p className="text-xl font-bold text-white">{loading ? '...' : progressStats.totalLessons}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] text-emerald-500/70 mb-1 uppercase font-bold tracking-widest">Accuracy</p>
                                    <p className="text-xl font-bold text-emerald-400">{loading ? '...' : `${progressStats.averageAccuracy}%`}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </Card>

                {/* Streak Card */}
                <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-[#0b101a] border-orange-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none" />
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                        <Flame className="w-10 h-10" />
                    </div>
                    <h3 className="text-5xl font-black text-white mb-1 shadow-orange-500/50 drop-shadow-md">{profile?.streak || 0}</h3>
                    <p className="text-orange-300/80 font-bold tracking-widest uppercase text-sm mb-4">Day Streak</p>
                    <p className="text-xs text-slate-400 max-w-[200px]">Complete a lesson or practice today to keep your fire lit! 🔥</p>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/ai-tutor">
                    <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 hover:from-indigo-500/20 hover:to-purple-600/20 border-indigo-500/20 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">AI Tutor</h3>
                                <p className="text-sm text-slate-400">Ask a question</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href="/dashboard/past-papers">
                    <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 hover:from-emerald-500/20 hover:to-teal-600/20 border-emerald-500/20 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Past Papers</h3>
                                <p className="text-sm text-slate-400">Practice now</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href={continueLink}>
                    <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 hover:from-blue-500/20 hover:to-indigo-600/20 border-blue-500/20 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Continue</h3>
                                <p className="text-sm text-slate-400">Resume learning</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Your Subjects */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Your Subjects</h2>
                    <Link href="/dashboard/subjects" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* ── EMPTY STATE: new users ── */}
                {isNewUser ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* First Lesson CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/20 relative overflow-hidden h-full flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="text-4xl mb-4">🎯</div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Ready to start your A/L journey?
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Your first lesson{firstSubject ? ` in ${firstSubject.name}` : ''} is waiting.
                                        It only takes 15 minutes.
                                    </p>
                                    <Link href={firstLessonLink}>
                                        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold flex items-center gap-2 group">
                                            Start My First Lesson
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Daily Goal Setup */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/20 h-full flex flex-col justify-between">
                                <div>
                                    <div className="text-4xl mb-4">🏆</div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        Set your daily study goal
                                    </h3>
                                    <p className="text-slate-400 text-xs mb-6">
                                        Most A-grade students earn 100 XP/day
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {[50, 100, 150, 200].map((xp) => (
                                            <button
                                                key={xp}
                                                onClick={() => handleSetGoal(xp)}
                                                disabled={savingGoal}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm ${dailyGoalXP === xp
                                                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                                                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                                                    }`}
                                            >
                                                <span>{xp} XP</span>
                                                {dailyGoalXP === xp && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        You can change this anytime from your profile.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                ) : (
                    /* ── NORMAL STATE: subjects with progress ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {!loading && userSubjects.map((subject, i) => {
                            const completed = progressStats.subjectProgress[subject.id] || 0;
                            const total = subject.lessonCount || 1;
                            const percentage = Math.round((completed / total) * 100);

                            return (
                                <motion.div
                                    key={subject.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link href={`/dashboard/subjects/${subject.id}`} className="block group">
                                        <Card className="p-6 bg-black/20 border-white/5 hover:border-white/20 transition-all relative overflow-hidden h-full">
                                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" style={{ background: subject.color }} />

                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                                        style={{ background: `${subject.color}15`, color: subject.color }}
                                                    >
                                                        {subject.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                                                        <p className="text-xs text-slate-500">{subject.unitCount} Units Total</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold" style={{ color: subject.color }}>{percentage}%</span>
                                                    <p className="text-xs text-slate-500">Completed</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="text-slate-400">Overall Progress</span>
                                                        <span className="text-white font-medium">{completed} / {total}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, background: subject.color }} />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                                                        <Clock className="w-3.5 h-3.5" /> Jump back in
                                                    </p>
                                                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                                        Continue {subject.name} journey
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}

                        {(!loading && userSubjects.length === 0) && (
                            <div className="col-span-full p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                                <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                                <h3 className="text-white font-medium mb-1">No subjects selected</h3>
                                <p className="text-slate-400 text-sm mb-4">Go back to onboarding to select your subjects.</p>
                                <Link href="/onboarding">
                                    <Button variant="outline" className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10">
                                        Select Subjects
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
