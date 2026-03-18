'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, LayoutDashboard, FileVideo, Users, Settings, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login');
            } else if (profile && profile.email !== 'jezeerahamed254@gmail.com') {
                // Simple mock of Admin Authorization using the creator's email
                // In reality, this would check profile.role === 'admin'
                router.push('/dashboard');
            }
        }
    }, [user, profile, loading, router]);

    if (loading) return (
        <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );

    if (!user || (profile && profile.email !== 'jezeerahamed254@gmail.com')) {
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
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center">
                            <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">ICONIC <span className="text-rose-500">ADMIN</span></span>
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
