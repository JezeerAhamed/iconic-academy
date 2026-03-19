import { NextRequest, NextResponse } from 'next/server';
import { consumeRateLimit } from '@/lib/rate-limit';
import {
  createCsrfToken,
  CSRF_COOKIE_NAME,
  getCsrfCookieOptions,
  SESSION_COOKIE_NAME,
  verifyNextAuthJwtSession,
  verifySessionToken,
  verifySupabaseJwtSession,
} from '@/lib/session';
import { serverEnv } from '@/lib/env';

type AuthState = {
  authenticated: boolean;
  isAdmin: boolean;
  userId?: string;
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return request.headers.get('x-real-ip') || '0.0.0.0';
}

function getRateLimitPolicy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/auth/session' && request.method === 'POST') {
    const authFlow = request.headers.get('x-auth-flow');

    if (authFlow === 'signup') {
      return { name: 'auth-signup', limit: 3, windowSeconds: 60 * 60 };
    }

    if (authFlow === 'login' || authFlow === 'google') {
      return { name: 'auth-login', limit: 5, windowSeconds: 15 * 60 };
    }
  }

  if (pathname.startsWith('/api/')) {
    return { name: 'api', limit: 60, windowSeconds: 60 };
  }

  return null;
}

function setRateLimitHeaders(response: NextResponse, rateLimit: Awaited<ReturnType<typeof consumeRateLimit>>) {
  response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(rateLimit.resetAt));
  return response;
}

async function getFirebaseAuthState(request: NextRequest): Promise<AuthState> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return { authenticated: false, isAdmin: false };
  }

  const session = await verifySessionToken(token, serverEnv.sessionSecret);

  if (!session) {
    return { authenticated: false, isAdmin: false };
  }

  return {
    authenticated: true,
    isAdmin: session.isAdmin,
    userId: session.sub,
  };
}

async function getSupabaseAuthState(request: NextRequest): Promise<AuthState> {
  const token =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value;

  if (!token || !process.env.SUPABASE_JWT_SECRET) {
    return { authenticated: false, isAdmin: false };
  }

  const session = await verifySupabaseJwtSession(token, process.env.SUPABASE_JWT_SECRET);

  return {
    authenticated: Boolean(session),
    isAdmin: Boolean(session && (session as Record<string, unknown>).role === 'admin'),
    userId: session ? (session as Record<string, unknown>).sub as string : undefined,
  };
}

async function getNextAuthState(request: NextRequest): Promise<AuthState> {
  const token =
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('authjs.session-token')?.value;

  if (!token || !process.env.NEXTAUTH_SECRET) {
    return { authenticated: false, isAdmin: false };
  }

  const session = await verifyNextAuthJwtSession(token, process.env.NEXTAUTH_SECRET);

  return {
    authenticated: Boolean(session),
    isAdmin: Boolean(session && (session as Record<string, unknown>).role === 'admin'),
    userId: session ? (session as Record<string, unknown>).sub as string : undefined,
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);
  const policy = getRateLimitPolicy(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-ip', ip);

  if (policy) {
    const rateLimit = await consumeRateLimit({
      key: `${policy.name}:${ip}`,
      limit: policy.limit,
      windowSeconds: policy.windowSeconds,
    });

    requestHeaders.set('x-rate-limit-limit', String(rateLimit.limit));
    requestHeaders.set('x-rate-limit-remaining', String(rateLimit.remaining));
    requestHeaders.set('x-rate-limit-reset', String(rateLimit.resetAt));

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
          },
        }
      );

      return setRateLimitHeaders(response, rateLimit);
    }
  }

  if (
    pathname.startsWith('/api/') &&
    request.method === 'POST' &&
    pathname !== '/api/stripe/webhook'
  ) {
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    const headerToken = request.headers.get('x-csrf-token');

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return NextResponse.json(
        { error: 'CSRF validation failed.' },
        { status: 403 }
      );
    }
  }

  const firebaseAuthState = await getFirebaseAuthState(request);

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!firebaseAuthState.authenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith('/admin') && !firebaseAuthState.isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!request.cookies.get(CSRF_COOKIE_NAME)?.value) {
    response.cookies.set(CSRF_COOKIE_NAME, createCsrfToken(), getCsrfCookieOptions());
  }

  if (policy) {
    const limit = requestHeaders.get('x-rate-limit-limit');
    const remaining = requestHeaders.get('x-rate-limit-remaining');
    const reset = requestHeaders.get('x-rate-limit-reset');
    if (limit) response.headers.set('X-RateLimit-Limit', limit);
    if (remaining) response.headers.set('X-RateLimit-Remaining', remaining);
    if (reset) response.headers.set('X-RateLimit-Reset', reset);
  }

  return response;
}

// Firebase is the active strategy in this repo because the app currently uses Firebase Auth.
// Supabase strategy is implemented in `getSupabaseAuthState()` for projects that store a JWT cookie.
// NextAuth strategy is implemented in `getNextAuthState()` for projects that use a JWT session cookie.
// They stay here as labeled reference implementations for future provider swaps.
void getSupabaseAuthState;
void getNextAuthState;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml|map)$).*)',
  ],
};
