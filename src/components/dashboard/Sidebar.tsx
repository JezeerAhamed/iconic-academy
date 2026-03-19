'use client';

import EmojiIcon from '@/components/accessibility/EmojiIcon';
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
    Flame,
} from 'lucide-react';

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
    // Admin is intentionally unlinked from learner navigation.
    // Access is only via direct URL plus middleware/admin checks.
    const navItems = BASE_NAV_ITEMS;

    const enrolledSubjects = SUBJECTS.filter((subject) => (profile?.enrolledSubjects ?? []).includes(subject.id));
    const streakCalendar = gamData.streakDays.length === 7
        ? gamData.streakDays
        : Array(7).fill(false).map((_, index) => index < Math.min(gamData.streak, 6));

    return (
        <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-cgray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
            <div className="p-4 border-b border-cgray-100">
                <div className="w-10 h-10 rounded-full bg-cblue-500 text-white font-bold text-sm flex items-center justify-center mb-2 overflow-hidden">
                    {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                        profile?.displayName?.charAt(0).toUpperCase() || 'S'
                    )}
                </div>
                <p className="text-sm font-semibold text-cgray-900 truncate">{profile?.displayName || 'Student'}</p>
                <p className="text-xs text-cgray-500">Level {level} - {profile?.level || 'Beginner'}</p>
            </div>

            <div className="px-4 py-3 border-b border-cgray-100">
                <div className="flex justify-between text-xs text-cgray-500 mb-1.5">
                    <span>{userXP.toLocaleString()} XP</span>
                    <span>{nextLevelXP.toLocaleString()} next</span>
                </div>
                <div className="w-full bg-cgray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-cblue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(0, Math.min(xpPercent, 100))}%` }}
                    />
                </div>
            </div>

            <nav aria-label="Dashboard navigation" className="flex-1 py-2">
                <p className="px-4 pt-4 pb-1 text-xs font-semibold text-cgray-400 uppercase tracking-wider">Learning</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                isActive
                                    ? 'flex items-center gap-3 px-4 py-2.5 text-sm text-cblue-500 font-semibold bg-cblue-25 border-r-2 border-cblue-500 transition-colors cursor-pointer'
                                    : 'flex items-center gap-3 px-4 py-2.5 text-sm text-cgray-700 font-normal hover:bg-cgray-50 hover:text-cgray-900 transition-colors cursor-pointer rounded-none'
                            }
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}

                {enrolledSubjects.length > 0 ? (
                    <div className="px-4 pt-4">
                        <p className="pb-2 text-xs font-semibold text-cgray-400 uppercase tracking-wider">Subjects</p>
                        <div className="flex flex-wrap gap-2">
                            {enrolledSubjects.map((subject) => (
                                <Link
                                    key={subject.id}
                                    href={`/dashboard/subjects/${subject.id}`}
                                    className="inline-flex items-center gap-1 rounded-full border border-cgray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-cgray-700 transition-colors hover:bg-cgray-50"
                                >
                                    <EmojiIcon emoji={subject.icon} label={subject.name} decorative />
                                    <span>{subject.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}
            </nav>

            <div className="p-4 border-t border-cgray-100 mt-auto">
                <div className="bg-cgray-50 rounded p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-cgray-900">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span>{gamData.streak} Day Streak</span>
                    </div>
                    <p className="text-xs text-cgray-500 mt-1">Study today to keep your streak alive.</p>
                    <div className="mt-3 flex justify-between">
                        {DAYS.map((day, index) => {
                            const done = streakCalendar[index];

                            return (
                                <div key={day + index} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-medium text-cgray-400">{day}</span>
                                    <span
                                        className={
                                            done
                                                ? 'h-2.5 w-2.5 rounded-full bg-cblue-500'
                                                : 'h-2.5 w-2.5 rounded-full bg-white border border-cgray-300'
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <button
                    onClick={signOut}
                    className="mt-3 flex w-full items-center gap-3 px-4 py-2.5 text-sm text-cgray-700 font-normal hover:bg-cgray-50 hover:text-cgray-900 transition-colors cursor-pointer rounded-none"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
