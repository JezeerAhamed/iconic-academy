'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, LayoutDashboard, FileVideo, Users, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isAdmin = profile?.isAdmin === true;

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login');
            } else if (profile && !isAdmin) {
                router.push('/dashboard');
            }
        }
    }, [user, profile, loading, router, isAdmin]);

    if (loading) return (
        <div className="min-h-screen bg-[#080c14] p-6">
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[240px_1fr]">
                <div className="space-y-4 rounded-3xl border border-white/5 bg-[#0b101a] p-6">
                    <div className="h-6 w-28 animate-pulse rounded bg-white/10" />
                    <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
                    <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
                    <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
                </div>
                <div className="space-y-6 rounded-3xl border border-white/5 bg-[#0b101a] p-6">
                    <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
                        <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
                        <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
                    </div>
                    <div className="h-80 animate-pulse rounded-3xl bg-white/5" />
                </div>
            </div>
        </div>
    );

    if (!user || (profile && !isAdmin)) {
        return (
            <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center text-center p-4">
                <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-8 max-w-md">You do not have the required administrator privileges to view this area.</p>
                <Link href="/dashboard" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    const navItems = [
        { name: 'Analytics', href: '/admin', icon: LayoutDashboard },
        { name: 'Content Manager', href: '/admin/content', icon: FileVideo },
        { name: 'Students', href: '/admin/students', icon: Users },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#04060a] text-slate-300 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#080c14] hidden md:flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="relative h-11 w-[150px] overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-rose-500/10">
                            <Image
                                src="/logo.jpg"
                                alt="Iconic Academy"
                                fill
                                priority
                                sizes="150px"
                                className="object-cover"
                            />
                        </div>
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-400">
                            Admin
                        </span>
                    </Link>
                </div>

                <nav className="p-4 space-y-1 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-rose-500/10 text-rose-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 w-full"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                <header className="h-16 border-b border-white/5 bg-[#080c14] flex items-center px-8 shrink-0">
                    <div className="flex items-center justify-end w-full gap-4">
                        <span className="text-sm font-medium px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                            Admin Mode Active
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
