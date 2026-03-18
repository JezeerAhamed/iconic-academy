'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ReactNode } from 'react';

// Wrap all providers here (Auth, React Query, etc)
export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
