// =====================================================
// ICONIC ACADEMY – Firebase Configuration
// =====================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    inMemoryPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent duplicate initialization in hot-reload / SSR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

// Set persistence to LOCAL so Firebase stores the session in localStorage.
// This prevents the "auth/visibility-check-was-unavailable" error caused by
// reCAPTCHA/third-party cookie checks when using the default session persistence.
// Falls back to inMemory if localStorage is blocked (e.g. private browsing with strict settings).
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch(() => {
        setPersistence(auth, inMemoryPersistence).catch(() => {
            console.warn('[Firebase] Could not set auth persistence.');
        });
    });
}
