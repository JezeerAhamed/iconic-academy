'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
    Search,
    Flame,
    Zap,
    ChevronDown,
    LayoutDashboard,
    BookOpen,
    Trophy,
    Settings,
    LogOut,
    Menu,
} from 'lucide-react';

export default function AppNavbar() {
    const { user, profile, signOut } = useAuth();
    const pathname = usePathname();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [gamData, setGamData] = useState<{ streak: number; todayXP: number; dailyGoalXP: number }>({
        streak: 0,
        todayXP: 0,
        dailyGoalXP: 100,
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch gamification data
    useEffect(() => {
        async function fetchGam() {
            if (!user?.uid) return;
            const snap = await getDoc(doc(db, 'gamification', user.uid));
            if (snap.exists()) {
                const d = snap.data();
                setGamData({
                    streak: d.streak ?? 0,
                    todayXP: d.todayXP ?? 0,
                    dailyGoalXP: d.dailyGoalXP ?? 100,
                });
            }
        }
        fetchGam();
    }, [user?.uid]);

    // Scroll listener
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const goalProgress = gamData.dailyGoalXP > 0 ? Math.min(gamData.todayXP / gamData.dailyGoalXP, 1) : 0;
    const circumference = 2 * Math.PI * 14; // r=14
    const strokeDashoffset = circumference * (1 - goalProgress);
    const goalComplete = goalProgress >= 1;

    const avatarLetter = profile?.displayName?.charAt(0).toUpperCase() || 'S';

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${scrolled
                    ? 'bg-[#0b101a]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
                    : 'bg-[#0b101a]/80 backdrop-blur-lg border-b border-white/5'
                }`}
        >
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
                {/* Left: Logo */}
                <Link href="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="relative h-9 w-[132px] overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-indigo-500/10 transition-transform duration-200 group-hover:scale-[1.02]">
                        <Image
                            src="/logo.jpg"
                            alt="Iconic Academy"
                            fill
                            priority
                            sizes="132px"
                            className="object-cover"
                        />
                    </div>
                </Link>

                {/* Center: Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search lessons, topics..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                            readOnly
                        />
                    </div>
                </div>

                {/* Right: Gamification + Avatar */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Streak */}
                    <div className="flex items-center gap-1.5 text-sm">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="font-bold text-orange-300 tabular-nums">{gamData.streak}</span>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-1.5 text-sm">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold text-yellow-300 tabular-nums">{profile?.xp ?? 0}</span>
                    </div>

                    {/* Daily Goal Ring */}
                    <div className="relative w-9 h-9 flex items-center justify-center" title={`${gamData.todayXP}/${gamData.dailyGoalXP} XP today`}>
                        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                            <circle
                                cx="18" cy="18" r="14"
                                fill="none"
                                stroke={goalComplete ? '#22c55e' : '#a78bfa'}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-700"
                            />
                        </svg>
                        <span className="absolute text-[9px] font-bold text-white">{Math.round(goalProgress * 100)}%</span>
                    </div>

                    {/* Avatar Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold text-sm overflow-hidden flex-shrink-0">
                                {profile?.photoURL ? (
                                    <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    avatarLetter
                                )}
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                {/* User info header */}
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-sm font-medium text-white truncate">{profile?.displayName || 'Student'}</p>
                                    <p className="text-xs text-slate-500 truncate">{profile?.email || ''}</p>
                                </div>

                                {/* Links */}
                                <div className="py-1">
                                    {[
                                        { label: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
                                        { label: 'My Subjects', href: '/dashboard/subjects', icon: BookOpen },
                                        { label: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
                                        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setDropdownOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${pathname === item.href
                                                    ? 'text-indigo-400 bg-indigo-500/10'
                                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>

                                {/* Sign Out */}
                                <div className="border-t border-white/5 py-1">
                                    <button
                                        onClick={() => { setDropdownOpen(false); signOut(); }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
