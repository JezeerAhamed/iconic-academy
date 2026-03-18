'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, Trophy, Flame, Clock, BrainCircuit, Target, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardOverview() {
    const { profile } = useAuth();

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

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
                        <Flame className="w-4 h-4" />
                        <span>{profile?.streak || 0} Day Streak</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                        <Trophy className="w-4 h-4" />
                        <span>Level {Math.floor((profile?.xp || 0) / 1000) + 1}</span>
                    </div>
                </div>
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
