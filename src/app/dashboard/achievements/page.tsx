'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Trophy, Flame, Target, Zap, Star, Shield, Award, Crown, BookOpen, Clock, Users, ArrowUpCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLevelProgress } from '@/lib/gamification';
import { UserLevel } from '@/lib/types';

// Complete Badge List
const BADGE_DEFINITIONS = [
    { id: 'first_lesson', title: 'First Steps', description: 'Complete your first A/L syllabus lesson.', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
    { id: 'week_warrior', title: 'Week Warrior', description: 'Maintain a 7-day learning streak.', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { id: 'sharpshooter', title: 'Sharpshooter', description: 'Achieve 100% accuracy in a practice session.', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { id: 'speed_demon', title: 'Speed Demon', description: 'Complete a lesson 2x faster than average.', icon: Clock, color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: 'perfect_paper', title: 'Perfect Paper', description: 'Score 100% on a past paper.', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { id: 'einstein', title: 'Einstein', description: 'Master all Physics units.', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: 'organic_master', title: 'Organic Master', description: 'Master all Organic Chemistry units.', icon: Shield, color: 'text-teal-400', bg: 'bg-teal-500/20' },
    { id: 'island_ranker', title: 'Island Ranker', description: 'Reach the Ranker level.', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { id: 'helpful_peer', title: 'Helpful Peer', description: 'Answer 10 questions in the community.', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { id: 'bilingual_scholar', title: 'Bilingual Scholar', description: 'Attempt questions in both Sinhala & English.', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { id: 'comeback_kid', title: 'Comeback Kid', description: 'Recover a lost streak.', icon: ArrowUpCircle, color: 'text-lime-400', bg: 'bg-lime-500/20' },
];

export default function AchievementsPage() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [gamification, setGamification] = useState({
        xpTotal: 0,
        level: 'Beginner' as UserLevel,
        currentStreak: 0,
        longestStreak: 0,
        badges: [] as string[]
    });

    useEffect(() => {
        async function fetchGamification() {
            if (!profile?.uid) return;
            try {
                const docRef = doc(db, 'gamification', profile.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setGamification({
                        xpTotal: docSnap.data().xpTotal || 0,
                        level: docSnap.data().level || 'Beginner',
                        currentStreak: docSnap.data().currentStreak || 0,
                        longestStreak: docSnap.data().longestStreak || 0,
                        badges: docSnap.data().badges || []
                    });
                }
            } catch (error) {
                console.error("Error fetching gamification:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGamification();
    }, [profile?.uid]);

    if (loading) {
        return (
            <div className="space-y-8 pb-12 max-w-6xl mx-auto">
                <div>
                    <div className="h-8 w-64 bg-white/10 rounded animate-pulse mb-3" />
                    <div className="h-4 w-96 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="h-48 md:col-span-2 bg-white/5 animate-pulse" />
                    <Card className="h-48 bg-white/5 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <Card key={i} className="h-32 bg-white/5 animate-pulse" />)}
                </div>
            </div>
        );
    }

    const { currentXPInLevel, requiredXP, percentage } = getLevelProgress(gamification.xpTotal, gamification.level);

    return (
        <div className="space-y-8 pb-12 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Achievements</h1>
                <p className="text-slate-400">Track your level, streaks, and unlock exclusive badges.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Level Card */}
                <Card className="p-6 md:col-span-2 bg-[#0b101a] border-white/5 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="flex items-center gap-6 mb-6 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20">
                            <div className="w-full h-full bg-[#0b101a] rounded-full flex flex-col items-center justify-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lvl</span>
                                <span className="text-3xl font-black text-white leading-none">
                                    {gamification.level === 'Ranker' ? 'MAX' : Math.floor(gamification.xpTotal / 5000) + 1}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{gamification.level} Rank</h2>
                            <p className="text-slate-400">{gamification.xpTotal.toLocaleString()} Total XP Earned</p>
                        </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Progress to Next Level</span>
                            <span className="text-indigo-400 font-bold">{Math.round(currentXPInLevel).toLocaleString()} / {Math.round(requiredXP).toLocaleString()} XP</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Streak Card */}
                <Card className="p-6 bg-[#0b101a] border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 border border-orange-500/30 relative z-10">
                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Current Streak</p>
                    <h2 className="text-4xl font-black text-white relative z-10">{gamification.currentStreak} Days</h2>
                    <p className="text-xs text-orange-400 font-medium mt-2 relative z-10">Personal Best: {gamification.longestStreak} Days</p>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" /> Milestone Badges
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BADGE_DEFINITIONS.map((badge, i) => {
                        const isUnlocked = gamification.badges.includes(badge.id);
                        return (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className={`p-6 border transition-all h-full relative overflow-hidden ${isUnlocked
                                    ? 'bg-black/20 border-white/10 hover:border-white/20'
                                    : 'bg-black/40 border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                                    }`}>
                                    <div className="flex items-start gap-4 mb-2">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${badge.bg}`}>
                                            <badge.icon className={`w-6 h-6 ${badge.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                {badge.title}
                                                {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                                            </h3>
                                            <p className="text-sm text-slate-400 leading-relaxed mt-1">{badge.description}</p>
                                        </div>
                                    </div>

                                    {isUnlocked && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                            <Trophy className="w-3.5 h-3.5" /> Unlocked
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
