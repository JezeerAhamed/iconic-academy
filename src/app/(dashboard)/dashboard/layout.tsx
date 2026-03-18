'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

function DashboardLayoutSkeleton() {
    return (
        <div className="flex min-h-screen bg-[#080c14]">
            <div className="hidden w-64 border-r border-white/5 bg-[#0b101a] md:block">
                <div className="space-y-4 p-5">
                    <div className="h-8 w-28 animate-pulse rounded bg-white/10" />
                    <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-11 animate-pulse rounded-xl bg-white/5" />
                    ))}
                </div>
            </div>

            <main className="flex-1 p-4 pt-16 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="h-5 w-36 animate-pulse rounded bg-white/10" />
                    <div className="rounded-3xl border border-white/10 bg-[#0b101a] p-6">
                        <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
                        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-white/5" />
                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="h-36 animate-pulse rounded-2xl bg-white/5" />
                            <div className="h-36 animate-pulse rounded-2xl bg-white/5" />
                            <div className="h-36 animate-pulse rounded-2xl bg-white/5" />
                        </div>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="h-72 animate-pulse rounded-3xl bg-[#0b101a]" />
                        <div className="h-72 animate-pulse rounded-3xl bg-[#0b101a]" />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        } else if (!loading && user && profile && !profile.onboardingComplete) {
            router.push('/onboarding');
        }
    }, [user, profile, loading, router]);

    if (loading || !user) {
        return <DashboardLayoutSkeleton />;
    }

    if (profile && !profile.onboardingComplete) {
        return <DashboardLayoutSkeleton />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#080c14]">
            {/* Sidebar Navigation (hidden on mobile) */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pl-0 md:pl-64 pt-14 md:pt-0 pb-16 md:pb-0">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <Breadcrumbs />
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Tab Bar */}
            <MobileBottomNav />
        </div>
    );
}
