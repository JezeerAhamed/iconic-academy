'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

function DashboardLayoutSkeleton() {
    return (
        <div className="flex min-h-screen bg-white">
            <div className="hidden w-60 border-r border-cgray-200 bg-white md:block">
                <div className="space-y-4 p-4">
                    <div className="h-14 animate-pulse rounded bg-cgray-100" />
                    <div className="h-16 animate-pulse rounded bg-cgray-50" />
                    <div className="h-10 animate-pulse rounded bg-cgray-50" />
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-10 animate-pulse rounded bg-cgray-50" />
                    ))}
                </div>
            </div>

            <main className="flex-1 md:ml-60">
                <div className="mx-auto max-w-coursera space-y-6 px-6 py-8">
                    <div className="h-4 w-36 animate-pulse rounded bg-cgray-100" />
                    <div className="rounded-lg border border-cgray-200 bg-white p-6 shadow-card">
                        <div className="h-8 w-56 animate-pulse rounded bg-cgray-100" />
                        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-cgray-100" />
                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="h-36 animate-pulse rounded bg-cgray-50" />
                            <div className="h-36 animate-pulse rounded bg-cgray-50" />
                            <div className="h-36 animate-pulse rounded bg-cgray-50" />
                        </div>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="h-72 animate-pulse rounded-lg border border-cgray-200 bg-white shadow-card" />
                        <div className="h-72 animate-pulse rounded-lg border border-cgray-200 bg-white shadow-card" />
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
        <div className="flex min-h-screen bg-white">
            <Sidebar />

            <main className="flex-1 md:ml-60 min-h-screen">
                <div className="mx-auto max-w-coursera px-6 py-8 pb-24 md:pb-8">
                    <Breadcrumbs />
                    {children}
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
}
