'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Target,
    BrainCircuit,
    Trophy,
    Settings,
    LogOut,
    Zap,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Subjects', href: '/dashboard/subjects', icon: BookOpen },
    { name: 'Past Papers', href: '/dashboard/past-papers', icon: Target },
    { name: 'AI Tutor', href: '/dashboard/ai-tutor', icon: BrainCircuit },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { profile, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#0b101a] border-r border-white/5 relative z-20">
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                        <Zap className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                        ICONIC
                    </span>
                </Link>
            </div>

            {/* User Mini Profile */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold text-xl flex-shrink-0 relative overflow-hidden">
                        {profile?.photoURL ? (
                            <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                        ) : (
                            profile?.displayName?.charAt(0).toUpperCase() || 'S'
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-white font-medium truncate">{profile?.displayName || 'Student'}</h3>
                        <p className="text-xs text-indigo-400 truncate">Lvl {Math.floor((profile?.xp || 0) / 1000) + 1} {profile?.level}</p>
                    </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">XP</span>
                        <span className="text-indigo-400 font-medium">{profile?.xp || 0} / {((Math.floor((profile?.xp || 0) / 1000) + 1)) * 1000}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${((profile?.xp || 0) % 1000) / 10}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header & Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0b101a]/80 backdrop-blur-lg border-b border-white/5 z-30 flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <span className="font-bold text-lg text-white">ICONIC</span>
                </Link>
                <button onClick={toggleSidebar} className="p-2 -mr-2 text-slate-400 hover:text-white">
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Desktop */}
            <aside className="hidden md:block fixed top-0 left-0 h-screen w-64 z-20">
                <SidebarContent />
            </aside>

            {/* Sidebar Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
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
