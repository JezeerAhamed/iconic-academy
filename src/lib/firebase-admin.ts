import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Handle escaped newlines from .env.local
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
    : '';

const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey,
};

// Initialize Firebase Admin only once
if (!getApps().length) {
    try {
        initializeApp({
            credential: cert(serviceAccount)
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const adminDb = getFirestore();
