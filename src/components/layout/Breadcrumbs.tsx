'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

// Human-readable label map for known path segments
const LABEL_MAP: Record<string, string> = {
    dashboard: 'Dashboard',
    subjects: 'My Subjects',
    'past-papers': 'Past Papers',
    'ai-tutor': 'AI Tutor',
    achievements: 'Achievements',
    analytics: 'Progress',
    planner: 'Planner',
    pricing: 'Pricing',
    settings: 'Settings',
    billing: 'Billing',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    'combined-maths': 'Combined Maths',
};

function toLabel(segment: string): string {
    if (LABEL_MAP[segment]) return LABEL_MAP[segment];
    // Convert kebab-case to Title Case
    return segment
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export default function Breadcrumbs() {
    const pathname = usePathname();

    // Don't show breadcrumbs on root-level pages
    if (pathname === '/' || pathname === '/dashboard') return null;

    const segments = pathname.split('/').filter(Boolean);

    // Build crumb list
    const crumbs: { label: string; href: string }[] = [];

    // Determine root
    const isDashboard = segments[0] === 'dashboard';

    if (isDashboard) {
        crumbs.push({ label: 'Dashboard', href: '/dashboard' });
        for (let i = 1; i < segments.length; i++) {
            crumbs.push({
                label: toLabel(segments[i]),
                href: '/' + segments.slice(0, i + 1).join('/'),
            });
        }
    } else {
        crumbs.push({ label: 'Home', href: '/' });
        for (let i = 0; i < segments.length; i++) {
            crumbs.push({
                label: toLabel(segments[i]),
                href: '/' + segments.slice(0, i + 1).join('/'),
            });
        }
    }

    return (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap scrollbar-none">
            {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                    <span key={crumb.href} className="flex items-center gap-1.5">
                        {i === 0 && <Home className="w-3 h-3 flex-shrink-0" />}
                        {i > 0 && <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />}
                        {isLast ? (
                            <span className="text-slate-300 font-medium truncate">{crumb.label}</span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="hover:text-indigo-400 transition-colors truncate"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
