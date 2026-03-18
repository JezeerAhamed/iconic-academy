import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDbInstance: Firestore | null = null;

function initAdminApp(): App {
    // Return existing app if already initialized
    if (getApps().length > 0) {
        return getApp();
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKeyRaw) {
        throw new Error(
            `Firebase Admin SDK: Missing required environment variables. ` +
            `Ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are set in Vercel.`
        );
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

    return initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
    });
}

/**
 * Returns the Firestore Admin instance.
 * Lazy-initialized — safe to import in any module without failing at build time.
 */
export function getAdminFirestore(): Firestore {
    if (!adminDbInstance) {
        adminApp = initAdminApp();
        adminDbInstance = getFirestore(adminApp);
    }
    return adminDbInstance;
}

// Also export as `adminDb` for backwards compatibility with existing imports
// This is a lazy getter — won't throw until actually called at runtime
export const adminDb = new Proxy({} as Firestore, {
    get(_target, prop) {
        const db = getAdminFirestore();
        const value = (db as any)[prop];
        return typeof value === 'function' ? value.bind(db) : value;
    }
});
