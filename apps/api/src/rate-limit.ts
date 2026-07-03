import type { MiddlewareHandler } from 'hono';

import type { ApiVariables } from './auth.js';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function createWriteRateLimit(options?: {
  windowMs?: number;
  maxRequests?: number;
}): MiddlewareHandler<{ Variables: ApiVariables }> {
  const windowMs = options?.windowMs ?? Number(process.env.WRITE_RATE_LIMIT_WINDOW_MS ?? 60_000);
  const maxRequests = options?.maxRequests ?? Number(process.env.WRITE_RATE_LIMIT_MAX ?? 120);

  return async (c, next) => {
    if (!writeMethods.has(c.req.method)) {
      await next();
      return;
    }

    const now = Date.now();
    const key = `${c.get('userId')}:${c.req.path}`;
    const existing = buckets.get(key);
    const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;

    bucket.count += 1;
    buckets.set(key, bucket);

    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(Math.max(maxRequests - bucket.count, 0)));
    c.header('X-RateLimit-Reset', new Date(bucket.resetAt).toISOString());

    if (bucket.count > maxRequests) {
      return c.json(
        {
          error: 'Write rate limit exceeded.',
          requestId: c.var.requestId,
          retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
        },
        429,
      );
    }

    await next();
  };
}
