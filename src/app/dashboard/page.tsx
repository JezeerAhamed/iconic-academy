'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Clock, BrainCircuit, Target, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getLevelProgress } from '@/lib/gamification';

export default function DashboardOverview() {
    const { profile } = useAuth();

    // Process Gamification Data
    const progressData = getLevelProgress(profile?.xp || 0, profile?.level || 'Beginner');

    // Just for nice greeting based on time of day
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    // Get user's selected subjects full objects
    const userSubjects = SUBJECTS.filter(s => profile?.subjects.includes(s.id));

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
                                    <p className="text-xl font-bold text-white">42</p>
                                </div>
                                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] text-emerald-500/70 mb-1 uppercase font-bold tracking-widest">Accuracy</p>
                                    <p className="text-xl font-bold text-emerald-400">88%</p>
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
                <Link href="/dashboard/subjects">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userSubjects.map((subject, i) => (
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
                                            <span className="text-2xl font-bold" style={{ color: subject.color }}>0%</span>
                                            <p className="text-xs text-slate-500">Completed</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-slate-400">Overall Progress</span>
                                                <span className="text-white font-medium">0 / {subject.lessonCount}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: '0%', background: subject.color }} />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                                                <Clock className="w-3.5 h-3.5" /> Up next
                                            </p>
                                            <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                                Unit 1: Introduction to {subject.name}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}

                    {userSubjects.length === 0 && (
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
            </div>
        </div>
    );
}
