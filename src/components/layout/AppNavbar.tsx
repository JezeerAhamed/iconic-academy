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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
  const circumference = 2 * Math.PI * 14;
  const strokeDashoffset = circumference * (1 - goalProgress);
  const goalComplete = goalProgress >= 1;

  const avatarLetter = profile?.displayName?.charAt(0).toUpperCase() || 'S';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled ? 'border-b border-cgray-200 bg-white shadow-nav' : 'border-b border-cgray-200 bg-white/95'
      }`}
    >
      <div className="mx-auto flex h-full max-w-coursera items-center justify-between px-6">
        <Link href="/dashboard" className="group flex flex-shrink-0 items-center gap-2">
          <div className="relative h-9 w-[132px] overflow-hidden rounded border border-cgray-200 bg-white transition-transform duration-200 group-hover:scale-[1.02]">
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

        <div className="mx-8 hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cgray-400" />
            <input
              type="text"
              placeholder="Search lessons, topics..."
              className="c-input w-full bg-white pl-10 pr-4 py-2 text-sm"
              readOnly
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-bold tabular-nums text-cgray-900">{gamData.streak}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="h-4 w-4 text-cyellow-500" />
            <span className="font-bold tabular-nums text-cgray-900">{profile?.xp ?? 0}</span>
          </div>

          <div
            className="relative flex h-9 w-9 items-center justify-center"
            title={`${gamData.todayXP}/${gamData.dailyGoalXP} XP today`}
          >
            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#E0E0E0" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={goalComplete ? '#2E7D32' : '#0056D2'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-cgray-900">{Math.round(goalProgress * 100)}%</span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded px-1 py-1 transition-all hover:bg-cgray-50"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-cblue-500 text-sm font-bold text-white">
                {profile?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-cgray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen ? (
              <div className="absolute right-0 top-full mt-2 z-50 w-56 overflow-hidden rounded border border-cgray-200 bg-white shadow-dropdown">
                <div className="border-b border-cgray-200 px-4 py-3">
                  <p className="truncate text-sm font-medium text-cgray-900">{profile?.displayName || 'Student'}</p>
                  <p className="truncate text-xs text-cgray-500">{profile?.email || ''}</p>
                </div>

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
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        pathname === item.href
                          ? 'bg-cblue-25 font-semibold text-cblue-500'
                          : 'text-cgray-700 hover:bg-cgray-50 hover:text-cgray-900'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-cgray-200 py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-cgray-700 transition-colors hover:bg-cred-50 hover:text-cred-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
