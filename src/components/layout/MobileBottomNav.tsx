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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b101a]/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
            <div className="flex items-center justify-around h-14 px-1">
                {TABS.map((tab) => {
                    const isActive = tab.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(tab.href);
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-500'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
