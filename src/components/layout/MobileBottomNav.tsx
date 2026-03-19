'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    BrainCircuit,
    Target,
    User,
} from 'lucide-react';

const TABS = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Subjects', href: '/dashboard/subjects', icon: BookOpen },
    { label: 'AI Tutor', href: '/dashboard/ai-tutor', icon: BrainCircuit },
    { label: 'Papers', href: '/dashboard/past-papers', icon: Target },
    { label: 'Profile', href: '/dashboard/achievements', icon: User },
];

export default function MobileBottomNav() {
    const { user } = useAuth();
    const pathname = usePathname();

    // Only show for authenticated users and on dashboard routes
    if (!user || !pathname.startsWith('/dashboard')) return null;

    return (
        <nav aria-label="Dashboard mobile navigation" className="fixed bottom-0 left-0 right-0 bg-white border-t border-cgray-200 flex md:hidden z-50 safe-area-bottom">
            <div className="flex items-center justify-around w-full">
                {TABS.map((tab) => {
                    const isActive = tab.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(tab.href);
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors cursor-pointer ${
                                isActive ? 'text-cblue-500 font-semibold' : 'text-cgray-500 hover:text-cblue-500'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
