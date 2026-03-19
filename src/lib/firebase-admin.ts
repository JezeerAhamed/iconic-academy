import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { serverEnv } from './env';

let adminApp: App | null = null;
let adminDbInstance: Firestore | null = null;
let adminAuthInstance: Auth | null = null;

function initAdminApp(): App {
    // Return existing app if already initialized
    if (getApps().length > 0) {
        return getApp();
    }

    const privateKey = serverEnv.firebaseAdminPrivateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

    return initializeApp({
        credential: cert({
            projectId: serverEnv.firebaseAdminProjectId,
            clientEmail: serverEnv.firebaseAdminClientEmail,
            privateKey,
        }),
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

export function getAdminAuth(): Auth {
    if (!adminAuthInstance) {
        adminApp = initAdminApp();
        adminAuthInstance = getAuth(adminApp);
    }

    return adminAuthInstance;
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
