'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Target, Zap, Star, Shield, Award, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Achievement Data
const ACHIEVEMENTS = [
    { id: 1, title: 'First Steps', description: 'Complete your first A/L syllabus lesson.', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/20', unlocked: true },
    { id: 2, title: 'Week Warrior', description: 'Maintain a 7-day learning streak.', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20', unlocked: true },
    { id: 3, title: 'Sharpshooter', description: 'Achieve 100% accuracy in a practice session.', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20', unlocked: true },
    { id: 4, title: 'Einstein In Training', description: 'Complete all units in Physics.', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/20', unlocked: false, progress: 45 },
    { id: 5, title: 'Organic Master', description: 'Score above 80% in Organic Chemistry past papers.', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/20', unlocked: false, progress: 10 },
    { id: 6, title: 'Island Ranker', description: 'Reach Level 10 (Advanced).', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/20', unlocked: false, progress: 75 },
];

export default function AchievementsPage() {
    const { profile } = useAuth();

    // XP & Level calculations
    const currentXP = profile?.xp || 0;
    const xpForNextLevel = 1000;
    const currentLevelInfo = { name: profile?.level || 'Beginner', number: Math.floor(currentXP / 1000) + 1 };
    const levelProgress = ((currentXP % 1000) / 1000) * 100;

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

                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20">
                            <div className="w-full h-full bg-[#0b101a] rounded-full flex flex-col items-center justify-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lvl</span>
                                <span className="text-3xl font-black text-white leading-none">{currentLevelInfo.number}</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{currentLevelInfo.name} Rank</h2>
                            <p className="text-slate-400">{currentXP} Total XP Earned</p>
                        </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Progress to Level {currentLevelInfo.number + 1}</span>
                            <span className="text-indigo-400 font-bold">{currentXP % 1000} / {xpForNextLevel} XP</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${levelProgress}%` }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Streak Card */}
                <Card className="p-6 bg-[#0b101a] border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 border border-orange-500/30">
                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Current Streak</p>
                    <h2 className="text-4xl font-black text-white">12 Days</h2>
                    <p className="text-xs text-orange-400 font-medium mt-2">Personal Best: 14 Days</p>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" /> Milestone Badges
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ACHIEVEMENTS.map((achievement, i) => (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`p-6 border transition-all h-full ${achievement.unlocked
                                    ? 'bg-black/20 border-white/10 hover:border-white/20'
                                    : 'bg-black/40 border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                                }`}>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${achievement.bg}`}>
                                        <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{achievement.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed mt-1">{achievement.description}</p>
                                    </div>
                                </div>

                                {!achievement.unlocked && achievement.progress !== undefined && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">Progress</span>
                                            <span className="text-slate-300 font-bold">{achievement.progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-slate-500 rounded-full"
                                                style={{ width: `${achievement.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {achievement.unlocked && (
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                        <Trophy className="w-3.5 h-3.5" /> Unlocked
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
