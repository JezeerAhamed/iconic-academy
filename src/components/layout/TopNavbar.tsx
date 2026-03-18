'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import PublicNavbar from './Navbar';
import AppNavbar from './AppNavbar';

export default function TopNavbar() {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    // Hide navbar entirely on onboarding page (full-screen experience)
    if (pathname === '/onboarding') return null;

    // Hide navbar on dashboard pages — the dashboard has its own sidebar header
    if (pathname.startsWith('/dashboard')) return null;

    // While loading auth, show public navbar to avoid flash
    if (loading || !user) return <PublicNavbar />;

    return <AppNavbar />;
}
