import { CONTACT } from './contact';

export const SESSION_COOKIE_NAME = 'iconic_session';
export const CSRF_COOKIE_NAME = 'iconic_csrf';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  email: string;
  isAdmin: boolean;
  provider: 'firebase';
  iat: number;
  exp: number;
};

type JwtHeader = {
  alg: 'HS256';
  typ: 'JWT';
};

function bytesToBase64Url(bytes: Uint8Array) {
  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(bytes).toString('base64')
      : btoa(String.fromCharCode(...bytes));

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function stringToBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  return bytesToBase64Url(bytes);
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);

  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(padded, 'base64'));
  }

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function base64UrlToString(value: string) {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

async function importSecret(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signHs256(data: string, secret: string) {
  const key = await importSecret(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verifyHs256(data: string, signature: string, secret: string) {
  const key = await importSecret(secret);
  return crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(data)
  );
}

export async function signSessionToken(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
  secret: string,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS
) {
  const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
  const issuedAt = Math.floor(Date.now() / 1000);
  const body: SessionPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + maxAgeSeconds,
  };

  const encodedHeader = stringToBase64Url(JSON.stringify(header));
  const encodedPayload = stringToBase64Url(JSON.stringify(body));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHs256(unsignedToken, secret);

  return `${unsignedToken}.${signature}`;
}

export async function verifySessionToken(token: string, secret: string) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, providedSignature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signatureValid = await verifyHs256(unsignedToken, providedSignature, secret);

  if (!signatureValid) {
    return null;
  }

  const header = JSON.parse(base64UrlToString(encodedHeader)) as JwtHeader;
  const payload = JSON.parse(base64UrlToString(encodedPayload)) as SessionPayload;

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    return null;
  }

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function verifySupabaseJwtSession(token: string, secret: string) {
  return verifySessionToken(token, secret);
}

export async function verifyNextAuthJwtSession(token: string, secret: string) {
  return verifySessionToken(token, secret);
}

export function createCsrfToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export function getSessionCookieOptions(maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

export function getCsrfCookieOptions() {
  return {
    httpOnly: false,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  };
}

export function buildWhatsAppUrl(message: string) {
  const encodedMessage = encodeURIComponent(message);
  return `${CONTACT.whatsappUrl}?text=${encodedMessage}`;
}
