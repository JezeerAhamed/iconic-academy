type PublicEnv = {
  appUrl: string;
  stripePublishableKey: string;
};

type ServerEnv = PublicEnv & {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  sessionSecret: string;
  firebaseAdminProjectId: string;
  firebaseAdminClientEmail: string;
  firebaseAdminPrivateKey: string;
};

const DEFAULT_APP_URL = 'https://iconicacademy.lk';

function assertPresent(name: string, value: string | undefined, errors: string[]) {
  if (!value || !value.trim()) {
    errors.push(name);
  }
}

function normaliseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function readPublicEnv(): PublicEnv {
  const configuredAppUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    DEFAULT_APP_URL;

  const appUrl = configuredAppUrl.startsWith('http')
    ? configuredAppUrl
    : `https://${configuredAppUrl}`;

  return {
    appUrl: normaliseUrl(appUrl),
    stripePublishableKey: (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').trim(),
  };
}

function readServerEnv(): ServerEnv {
  const errors: string[] = [];
  const publicValues = readPublicEnv();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
  const firebaseAdminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const firebaseAdminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const firebaseAdminPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  assertPresent('STRIPE_SECRET_KEY', stripeSecretKey, errors);
  assertPresent('STRIPE_WEBHOOK_SECRET', stripeWebhookSecret, errors);
  assertPresent('FIREBASE_ADMIN_PROJECT_ID', firebaseAdminProjectId, errors);
  assertPresent('FIREBASE_ADMIN_CLIENT_EMAIL', firebaseAdminClientEmail, errors);
  assertPresent('FIREBASE_ADMIN_PRIVATE_KEY', firebaseAdminPrivateKey, errors);

  if (!nextAuthSecret && !supabaseJwtSecret) {
    errors.push('NEXTAUTH_SECRET (or SUPABASE_JWT_SECRET)');
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid server environment configuration. Missing: ${errors.join(', ')}`
    );
  }

  return {
    ...publicValues,
    stripeSecretKey: stripeSecretKey!.trim(),
    stripeWebhookSecret: stripeWebhookSecret!.trim(),
    sessionSecret: (nextAuthSecret || supabaseJwtSecret)!.trim(),
    firebaseAdminProjectId: firebaseAdminProjectId!.trim(),
    firebaseAdminClientEmail: firebaseAdminClientEmail!.trim(),
    firebaseAdminPrivateKey: firebaseAdminPrivateKey!,
  };
}

export const publicEnv: PublicEnv = readPublicEnv();

export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, property) {
    const env = readServerEnv();
    return env[property as keyof ServerEnv];
  },
});
