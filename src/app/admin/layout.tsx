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

    if (loading) {
        return (
            <div className="min-h-screen bg-cgray-50 p-6">
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[240px_1fr]">
                    <div className="space-y-4 rounded-lg border border-cgray-200 bg-white p-6 shadow-card">
                        <div className="h-6 w-28 animate-pulse rounded bg-cgray-100" />
                        <div className="h-12 animate-pulse rounded bg-cgray-100" />
                        <div className="h-12 animate-pulse rounded bg-cgray-100" />
                        <div className="h-12 animate-pulse rounded bg-cgray-100" />
                    </div>
                    <div className="space-y-6 rounded-lg border border-cgray-200 bg-white p-6 shadow-card">
                        <div className="h-8 w-48 animate-pulse rounded bg-cgray-100" />
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="h-28 animate-pulse rounded bg-cgray-100" />
                            <div className="h-28 animate-pulse rounded bg-cgray-100" />
                            <div className="h-28 animate-pulse rounded bg-cgray-100" />
                        </div>
                        <div className="h-80 animate-pulse rounded bg-cgray-100" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user || (profile && !isAdmin)) {
        return (
            <div className="min-h-screen bg-cgray-50 flex flex-col items-center justify-center text-center p-4">
                <ShieldAlert className="mb-4 h-16 w-16 text-cred-500" />
                <h1 className="mb-2 text-3xl font-bold text-cgray-900">Access Denied</h1>
                <p className="mb-8 max-w-md text-cgray-600">You do not have the required administrator privileges to view this area.</p>
                <Link href="/dashboard" className="btn-primary hover:no-underline">
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
        <div className="min-h-screen bg-white text-cgray-700 flex">
            <aside className="hidden w-64 flex-col border-r border-cgray-200 bg-white md:flex">
                <div className="border-b border-cgray-200 p-6">
                    <Link href="/admin" className="flex items-center gap-3 hover:no-underline">
                        <div className="relative h-11 w-[150px] overflow-hidden rounded border border-cgray-200 bg-white">
                            <Image
                                src="/logo.jpg"
                                alt="Iconic Academy logo"
                                fill
                                priority
                                sizes="150px"
                                className="object-cover"
                            />
                        </div>
                        <span className="rounded-full bg-cblue-25 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cblue-500">
                            Admin
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                    isActive
                                        ? 'border-r-2 border-cblue-500 bg-cblue-25 font-semibold text-cblue-500'
                                        : 'text-cgray-700 hover:bg-cgray-50 hover:text-cgray-900'
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-cgray-200 p-4">
                    <button
                        onClick={signOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-cgray-700 transition-colors hover:bg-cgray-50 hover:text-cgray-900"
                    >
                        <LogOut className="h-5 w-5" /> Logout
                    </button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-16 shrink-0 items-center border-b border-cgray-200 bg-white px-8">
                    <div className="flex w-full items-center justify-end gap-4">
                        <span className="rounded-full bg-cblue-25 px-3 py-1 text-sm font-medium text-cblue-500">
                            Admin Mode Active
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-cgray-50 p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-6xl"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
