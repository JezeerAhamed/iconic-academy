'use client';

import { CSRF_COOKIE_NAME } from './session';

export function getCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return '';
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function getCsrfToken() {
  return getCookieValue(CSRF_COOKIE_NAME);
}

export function getSecureJsonHeaders(additionalHeaders: HeadersInit = {}) {
  const csrfToken = getCsrfToken();

  return {
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    ...additionalHeaders,
  };
}
