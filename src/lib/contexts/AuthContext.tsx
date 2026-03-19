'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    onAuthStateChanged,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getSecureJsonHeaders } from '@/lib/client-security';
import { sanitiseEmail, sanitiseInput } from '@/lib/sanitise';
import { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Creates/fetches user profile AND gamification doc in Firestore.
 * Safe to call multiple times — uses merge to avoid overwriting existing data.
 */
async function ensureUserDocuments(firebaseUser: FirebaseUser): Promise<UserProfile> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Brand new user — create complete profile
        const newProfile: Omit<UserProfile, 'uid'> = {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Student',
            photoURL: firebaseUser.photoURL || '',
            enrolledSubjects: [],
            level: 'Beginner' as any,
            examYear: new Date().getFullYear() + 1,
            plan: 'free' as any,
            onboardingComplete: false,
            xp: 0,
            streak: 0,
            lastLoginDate: new Date().toISOString(),
            badges: [],
            createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, { uid: firebaseUser.uid, ...newProfile });

        // Create gamification doc simultaneously
        const gamRef = doc(db, 'gamification', firebaseUser.uid);
        await setDoc(gamRef, {
            uid: firebaseUser.uid,
            xpTotal: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: serverTimestamp(),
            badges: [],
            dailyGoalXP: 100,
            todayXP: 0,
        });

        return { uid: firebaseUser.uid, ...newProfile };
    }

    // Return existing profile
    return userSnap.data() as UserProfile;
}

type AuthSessionFlow = 'refresh' | 'login' | 'signup' | 'google';

async function establishServerSession(firebaseUser: FirebaseUser, flow: AuthSessionFlow = 'refresh') {
    const idToken = await firebaseUser.getIdToken();

    const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: getSecureJsonHeaders({ 'x-auth-flow': flow }),
        body: JSON.stringify({ idToken }),
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error('Secure session could not be established.');
    }
}

async function clearServerSession() {
    await fetch('/api/auth/session', {
        method: 'DELETE',
        headers: getSecureJsonHeaders(),
        credentials: 'same-origin',
    }).catch((error) => {
        console.warn('Failed to clear server session', error);
    });
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    await establishServerSession(firebaseUser, 'refresh');
                    const userProfile = await ensureUserDocuments(firebaseUser);
                    setProfile(userProfile);
                    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
                        router.replace(userProfile.onboardingComplete ? '/dashboard' : '/onboarding');
                    }
                } catch (err) {
                    console.error('Failed to sync user profile:', err);
                }
            } else {
                await clearServerSession();
                setProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            const result = await signInWithPopup(auth, provider);
            await establishServerSession(result.user, 'google');
            const userProfile = await ensureUserDocuments(result.user);
            if (!userProfile.onboardingComplete) {
                router.push('/onboarding');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Google sign-in error:', error.code, error.message);
            // Re-throw with friendly message so the UI can display it
            if (error.code === 'auth/popup-blocked') throw new Error('Please allow popups for this site and try again.');
            if (error.code === 'auth/popup-closed-by-user') throw new Error('Sign-in cancelled.');
            if (error.code === 'auth/unauthorized-domain') throw new Error('This domain is not authorized. Please contact support.');
            if (error.code === 'auth/operation-not-allowed') throw new Error('Google sign-in is not enabled. Please contact support.');
            throw new Error(error.message || 'Google sign-in failed.');
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            const safeEmail = sanitiseEmail(email);
            const safePassword = sanitiseInput(password, { maxLength: 128, trim: false, stripHtml: false });
            const userCredential = await signInWithEmailAndPassword(auth, safeEmail, safePassword);
            await establishServerSession(userCredential.user, 'login');
            const userProfile = await ensureUserDocuments(userCredential.user);
            if (!userProfile.onboardingComplete) {
                router.push('/onboarding');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                throw new Error('Invalid email or password.');
            }
            throw new Error(error.message || 'Sign-in failed.');
        }
    };

    const signUpWithEmail = async (email: string, password: string, name: string) => {
        try {
            const safeEmail = sanitiseEmail(email);
            const safeName = sanitiseInput(name, { maxLength: 120 });
            const safePassword = sanitiseInput(password, { maxLength: 128, trim: false, stripHtml: false });
            const result = await createUserWithEmailAndPassword(auth, safeEmail, safePassword);
            // Set display name immediately before creating Firestore doc
            await updateProfile(result.user, { displayName: safeName });
            await establishServerSession(result.user, 'signup');
            // Create Firestore documents with the correct name
            await ensureUserDocuments({ ...result.user, displayName: safeName } as FirebaseUser);
            router.push('/onboarding');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') throw new Error('An account with this email already exists.');
            if (error.code === 'auth/weak-password') throw new Error('Password must be at least 6 characters.');
            throw new Error(error.message || 'Failed to create account.');
        }
    };

    const signOut = async () => {
        await clearServerSession();
        await firebaseSignOut(auth);
        setUser(null);
        setProfile(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
