'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    onAuthStateChanged,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile, SubscriptionPlan, UserLevel } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    // 🚀 DEMO MODE OVERRIDE 🚀
    const [user, setUser] = useState<FirebaseUser | null>({
        uid: 'demo-123',
        email: 'jezeerahamed254@gmail.com',
        displayName: 'Demo Student',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    } as any);

    const [profile, setProfile] = useState<UserProfile | null>({
        uid: 'demo-123',
        email: 'jezeerahamed254@gmail.com',
        displayName: 'Demo Student',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        subjects: ['physics', 'chemistry', 'maths'],
        level: 'Advanced',
        examYear: 2026,
        plan: 'pro',
        xp: 4500,
        streak: 12,
        lastLoginDate: new Date().toISOString(),
        badges: [],
        createdAt: new Date().toISOString(),
    });

    // Set loading to false immediately to show the app
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Firebase Auth is disabled for Demo Mode
        // onAuthStateChanged logic has been bypassed.
    }, []);

    const signInWithGoogle = async () => {
        // Mock sign in - redirect to onboarding or dashboard
        router.push('/dashboard');
    };

    const signOut = async () => {
        // Mock sign out
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
