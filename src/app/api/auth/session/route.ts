import { NextRequest, NextResponse } from 'next/server';
import { adminDb, getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { serverEnv } from '@/lib/env';
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  signSessionToken,
} from '@/lib/session';
import { sanitiseEmail, sanitiseInput } from '@/lib/sanitise';
import { withSecurity } from '@/lib/with-security';

export const dynamic = 'force-dynamic';

export const POST = withSecurity(async (request: NextRequest) => {
  const body = (await request.json()) as { idToken?: string };
  const idToken = sanitiseInput(body.idToken || '', { maxLength: 4096, trim: true, stripHtml: false });

  if (!idToken) {
    return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 400 });
  }

  getAdminFirestore();
  const adminAuth = getAdminAuth();
  const decodedToken = await adminAuth.verifyIdToken(idToken, true);
  const userRecord = await adminAuth.getUser(decodedToken.uid);
  const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

  const email = sanitiseEmail(userRecord.email || decodedToken.email || '');
  const isAdmin = userDoc.data()?.isAdmin === true;
  const sessionToken = await signSessionToken(
    {
      sub: decodedToken.uid,
      email,
      isAdmin,
      provider: 'firebase',
    },
    serverEnv.sessionSecret
  );

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE_NAME,
    sessionToken,
    getSessionCookieOptions()
  );

  return response;
});

export const DELETE = withSecurity(
  async () => {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      ...getSessionCookieOptions(),
      maxAge: 0,
    });
    return response;
  },
  {
    skipJsonContentType: true,
  }
);
