// =====================================================
// ICONIC ACADEMY – Firebase Configuration
// =====================================================
// Create a .env.local file in the project root with:
//
//   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
//   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
//   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
//   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
//   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
// =====================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-auth-domain',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project-id',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-storage',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'demo-sender',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
};

// Prevent duplicate initialization in hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
