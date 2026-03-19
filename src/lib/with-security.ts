import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from './env';

type SecurityOptions = {
  skipOriginCheck?: boolean;
  skipJsonContentType?: boolean;
  maxContentLengthBytes?: number;
};

type RouteContext = {
  params?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

type SecureHandler = (
  request: NextRequest,
  context: RouteContext
) => Promise<Response> | Response;

const DEFAULT_MAX_CONTENT_LENGTH = 1024 * 1024;

function getAllowedOrigins() {
  const origins = new Set<string>([
    publicEnv.appUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  return origins;
}

function applyRateLimitHeaders(response: Response, request: NextRequest) {
  const limit = request.headers.get('x-rate-limit-limit');
  const remaining = request.headers.get('x-rate-limit-remaining');
  const reset = request.headers.get('x-rate-limit-reset');

  if (limit) response.headers.set('X-RateLimit-Limit', limit);
  if (remaining) response.headers.set('X-RateLimit-Remaining', remaining);
  if (reset) response.headers.set('X-RateLimit-Reset', reset);

  return response;
}

function buildErrorResponse(status: number, message: string, request: NextRequest) {
  return applyRateLimitHeaders(
    NextResponse.json({ error: message }, { status }),
    request
  );
}

export function withSecurity(handler: SecureHandler, options: SecurityOptions = {}) {
  const {
    skipOriginCheck = false,
    skipJsonContentType = false,
    maxContentLengthBytes = DEFAULT_MAX_CONTENT_LENGTH,
  } = options;

  return async function securedHandler(request: NextRequest, context: RouteContext = {}) {
    try {
      const method = request.method.toUpperCase();
      const isJsonWrite = ['POST', 'PUT', 'PATCH'].includes(method);

      const contentLength = Number(request.headers.get('content-length') || '0');
      if (contentLength > maxContentLengthBytes) {
        console.warn('[security] Large payload rejected', {
          path: request.nextUrl.pathname,
          contentLength,
          ip: request.headers.get('x-request-ip'),
        });
        return buildErrorResponse(413, 'Payload too large.', request);
      }

      if (isJsonWrite && !skipJsonContentType) {
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
          return buildErrorResponse(415, 'Content-Type must be application/json.', request);
        }
      }

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !skipOriginCheck) {
        const origin = request.headers.get('origin');
        if (!origin || !getAllowedOrigins().has(origin)) {
          console.warn('[security] Invalid origin rejected', {
            path: request.nextUrl.pathname,
            origin,
            ip: request.headers.get('x-request-ip'),
          });
          return buildErrorResponse(403, 'Invalid request origin.', request);
        }
      }

      const response = await handler(request, context);
      return applyRateLimitHeaders(response, request);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.warn('[security] Malformed JSON payload', {
          path: request.nextUrl.pathname,
          ip: request.headers.get('x-request-ip'),
        });
        return buildErrorResponse(400, 'Malformed JSON payload.', request);
      }

      console.error('[security] Route handler failed', {
        path: request.nextUrl.pathname,
        error,
      });

      const message =
        process.env.NODE_ENV === 'production'
          ? 'Request could not be processed.'
          : error instanceof Error
            ? error.message
            : 'Request could not be processed.';

      return buildErrorResponse(500, message, request);
    }
  };
}
