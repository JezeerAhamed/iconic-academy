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
    ShieldAlert,
    Settings,
    LogOut,
    Zap,
    Flame,
    Menu,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_NAV_ITEMS = [
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
                const data = snap.data();
                setGamData({
                    streak: data.streak ?? 0,
                    todayXP: data.todayXP ?? 0,
                    dailyGoalXP: data.dailyGoalXP ?? 100,
                    streakDays: data.streakDays ?? Array(6).fill(true).concat([false]),
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
    const navItems = profile?.isAdmin
        ? [...BASE_NAV_ITEMS, { name: 'Admin', href: '/admin', icon: ShieldAlert }]
        : BASE_NAV_ITEMS;

    const enrolledSubjects = SUBJECTS.filter((subject) => (profile?.enrolledSubjects ?? []).includes(subject.id));
    const streakCalendar = gamData.streakDays.length === 7
        ? gamData.streakDays
        : Array(7).fill(false).map((_, index) => index < Math.min(gamData.streak, 6));

    const sidebarContent = (
        <div className="relative z-20 flex h-full flex-col overflow-y-auto border-r border-white/5 bg-[#0b101a] scrollbar-thin">
            <div className="flex h-16 flex-shrink-0 items-center border-b border-white/5 px-5">
                <Link href="/dashboard" className="group flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                        <Zap className="h-4 w-4 text-white" fill="currentColor" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">ICONIC</span>
                </Link>
            </div>

            <div className="flex-shrink-0 border-b border-white/5 p-4">
                <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-500/50 bg-indigo-500/20 text-lg font-bold text-indigo-400">
                        {profile?.photoURL ? (
                            <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                            profile?.displayName?.charAt(0).toUpperCase() || 'S'
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="truncate text-sm font-semibold text-white">{profile?.displayName || 'Student'}</h3>
                        <p className="text-xs text-indigo-400">Level {level} - {profile?.level || 'Beginner'}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span className="font-medium text-indigo-400">{userXP.toLocaleString()} XP</span>
                        <span className="text-slate-500">{xpToNext} XP to Level {level + 1}</span>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 border-b border-white/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
                        <svg className="-rotate-90 h-16 w-16" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
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
                        {goalComplete ? (
                            <p className="mt-0.5 text-[10px] font-medium text-green-400">Goal complete</p>
                        ) : null}
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-0.5 px-3 py-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                                isActive
                                    ? 'bg-purple-500/15 font-medium text-white'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-purple-300'
                            }`}
                        >
                            <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {enrolledSubjects.length > 0 ? (
                <div className="flex-shrink-0 px-4 pb-3">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-600">Subjects</p>
                    <div className="flex flex-wrap gap-1.5">
                        {enrolledSubjects.map((subject) => (
                            <Link
                                key={subject.id}
                                href={`/dashboard/subjects/${subject.id}`}
                                onClick={() => setIsOpen(false)}
                                className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors hover:opacity-80"
                                style={{
                                    borderColor: `${subject.color}40`,
                                    color: subject.color,
                                    background: `${subject.color}10`,
                                }}
                            >
                                {subject.icon} {subject.name}
                            </Link>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="flex-shrink-0 border-t border-white/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-bold text-white">{gamData.streak} Day Streak</span>
                </div>
                <p className="mb-2.5 text-[10px] text-slate-500">Study today to keep it going.</p>
                <div className="flex justify-between">
                    {DAYS.map((day, index) => {
                        const done = streakCalendar[index];
                        const isToday = index === 6;

                        return (
                            <div key={day + index} className="flex flex-col items-center gap-1">
                                <span className="text-[9px] font-medium text-slate-600">{day}</span>
                                <div
                                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold ${
                                        done
                                            ? 'border border-green-500/30 bg-green-500/20 text-green-400'
                                            : isToday
                                                ? 'border border-white/10 bg-white/5 text-slate-500 ring-2 ring-purple-500/30'
                                                : 'border border-white/5 bg-white/5 text-slate-600'
                                    }`}
                                >
                                    {done ? 'OK' : isToday ? 'Now' : '-'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-shrink-0 border-t border-white/5 p-3">
                <button
                    onClick={signOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-[#0b101a]/90 px-4 backdrop-blur-xl md:hidden">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Zap className="h-3.5 w-3.5 text-white" fill="currentColor" />
                    </div>
                    <span className="text-base font-bold text-white">ICONIC</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                        <Flame className="h-3.5 w-3.5 text-orange-400" />
                        <span className="font-bold text-orange-300">{gamData.streak}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <Zap className="h-3.5 w-3.5 text-yellow-400" />
                        <span className="font-bold text-yellow-300">{profile?.xp ?? 0}</span>
                    </div>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 text-slate-400 hover:text-white">
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 md:block">
                {sidebarContent}
            </aside>

            <AnimatePresence>
                {isOpen ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                            className="fixed left-0 top-0 z-50 h-screen w-64 md:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                ) : null}
            </AnimatePresence>
        </>
    );
}
