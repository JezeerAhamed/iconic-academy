'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Target,
    BrainCircuit,
    Trophy,
    BarChart3,
    Settings,
    LogOut,
    Zap,
    Flame,
    Menu,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Subjects', href: '/dashboard/subjects', icon: BookOpen },
    { name: 'Past Papers', href: '/dashboard/past-papers', icon: Target },
    { name: 'AI Tutor', href: '/dashboard/ai-tutor', icon: BrainCircuit },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
    { name: 'Progress', href: '/dashboard/progress', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Sidebar() {
    const pathname = usePathname();
    const { profile, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [gamData, setGamData] = useState({
        streak: 0,
        todayXP: 0,
        dailyGoalXP: 100,
        streakDays: [] as boolean[],
    });

    useEffect(() => {
        async function fetchGam() {
            if (!profile?.uid) return;
            const snap = await getDoc(doc(db, 'gamification', profile.uid));
            if (snap.exists()) {
                const d = snap.data();
                setGamData({
                    streak: d.streak ?? 0,
                    todayXP: d.todayXP ?? 0,
                    dailyGoalXP: d.dailyGoalXP ?? 100,
                    streakDays: d.streakDays ?? Array(6).fill(true).concat([false]),
                });
            }
        }
        fetchGam();
    }, [profile?.uid]);

    const userXP = profile?.xp || 0;
    const level = Math.floor(userXP / 1000) + 1;
    const nextLevelXP = level * 1000;
    const xpInLevel = userXP % 1000;
    const xpPercent = (xpInLevel / 1000) * 100;
    const xpToNext = nextLevelXP - userXP;

    const goalProgress = gamData.dailyGoalXP > 0 ? Math.min(gamData.todayXP / gamData.dailyGoalXP, 1) : 0;
    const circumference = 2 * Math.PI * 28;
    const strokeDashoffset = circumference * (1 - goalProgress);
    const goalComplete = goalProgress >= 1;

    const enrolledSubjects = SUBJECTS.filter(s => (profile?.enrolledSubjects ?? []).includes(s.id));

    // Build a 7-day streak calendar (filled from streakDays or from streak count)
    const streakCalendar = gamData.streakDays.length === 7
        ? gamData.streakDays
        : Array(7).fill(false).map((_, i) => i < Math.min(gamData.streak, 6));

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#0b101a] border-r border-white/5 relative z-20 overflow-y-auto scrollbar-thin">
            {/* Logo */}
            <div className="h-16 flex items-center px-5 border-b border-white/5 flex-shrink-0">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">ICONIC</span>
                </Link>
            </div>

            {/* User Card */}
            <div className="p-4 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold text-lg flex-shrink-0 overflow-hidden">
                        {profile?.photoURL ? (
                            <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                            profile?.displayName?.charAt(0).toUpperCase() || 'S'
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-sm font-semibold text-white truncate">{profile?.displayName || 'Student'}</h3>
                        <p className="text-xs text-indigo-400">Level {level} · {profile?.level || 'Beginner'}</p>
                    </div>
                </div>
                {/* XP Progress Bar */}
                <div className="space-y-1">
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span className="text-indigo-400 font-medium">{userXP.toLocaleString()} XP</span>
                        <span className="text-slate-500">{xpToNext} XP to Level {level + 1}</span>
                    </div>
                </div>
            </div>

            {/* Daily Goal Ring */}
            <div className="p-4 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            <circle
                                cx="32" cy="32" r="28"
                                fill="none"
                                stroke={goalComplete ? '#22c55e' : '#a78bfa'}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-700"
                            />
                        </svg>
                        <span className="absolute text-xs font-bold text-white">{Math.round(goalProgress * 100)}%</span>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-white">Today&apos;s Goal</p>
                        <p className="text-[10px] text-slate-500">{gamData.todayXP} / {gamData.dailyGoalXP} XP</p>
                        {goalComplete && <p className="text-[10px] text-green-400 font-medium mt-0.5">✓ Complete!</p>}
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-3 px-3 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                                    ? 'bg-purple-500/15 text-white font-medium'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-purple-300'
                                }`}
                        >
                            <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Subject Quick Access */}
            {enrolledSubjects.length > 0 && (
                <div className="px-4 pb-3 flex-shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-1.5">
                        {enrolledSubjects.map((s) => (
                            <Link
                                key={s.id}
                                href={`/dashboard/subjects/${s.id}`}
                                onClick={() => setIsOpen(false)}
                                className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors hover:opacity-80"
                                style={{
                                    borderColor: `${s.color}40`,
                                    color: s.color,
                                    background: `${s.color}10`,
                                }}
                            >
                                {s.icon} {s.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Streak Widget */}
            <div className="p-4 border-t border-white/5 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-bold text-white">{gamData.streak} Day Streak</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2.5">Study today to keep it going!</p>
                <div className="flex justify-between">
                    {DAYS.map((d, i) => {
                        const done = streakCalendar[i];
                        const isToday = i === 6;
                        return (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <span className="text-[9px] text-slate-600 font-medium">{d}</span>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${done
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : isToday
                                            ? 'bg-white/5 text-slate-500 border border-white/10 ring-2 ring-purple-500/30'
                                            : 'bg-white/5 text-slate-600 border border-white/5'
                                    }`}>
                                    {done ? '✓' : isToday ? '○' : '·'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Logout */}
            <div className="p-3 border-t border-white/5 flex-shrink-0">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header & Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0b101a]/90 backdrop-blur-xl border-b border-white/5 z-30 flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" fill="currentColor" />
                    </div>
                    <span className="font-bold text-base text-white">ICONIC</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-bold text-orange-300">{gamData.streak}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="font-bold text-yellow-300">{profile?.xp ?? 0}</span>
                    </div>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 text-slate-400 hover:text-white">
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block fixed top-0 left-0 h-screen w-64 z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                            className="fixed top-0 left-0 h-screen w-64 z-50 md:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
