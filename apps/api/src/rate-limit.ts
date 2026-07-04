import type { MiddlewareHandler } from 'hono';

import type { ApiVariables } from './auth.js';

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

interface RedisRateLimitClient {
  incr(key: string): Promise<number>;
  pexpire(key: string, milliseconds: number): Promise<unknown>;
  pttl(key: string): Promise<number>;
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function createRedisRateLimitStore(redis: RedisRateLimitClient): RateLimitStore {
  return {
    async increment(key, windowMs) {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }

      let ttl = await redis.pttl(key);
      if (ttl < 0) {
        await redis.pexpire(key, windowMs);
        ttl = windowMs;
      }

      return { count, resetAt: Date.now() + ttl };
    },
  };
}

export function createMemoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, MemoryBucket>();

  return {
    async increment(key, windowMs) {
      const now = Date.now();
      const existing = buckets.get(key);
      const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;

      bucket.count += 1;
      buckets.set(key, bucket);

      return { count: bucket.count, resetAt: bucket.resetAt };
    },
  };
}

export function createWriteRateLimit(options: {
  store: RateLimitStore;
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
}): MiddlewareHandler<{ Variables: ApiVariables }> {
  const windowMs = options.windowMs ?? Number(process.env.WRITE_RATE_LIMIT_WINDOW_MS ?? 60_000);
  const maxRequests = options.maxRequests ?? Number(process.env.WRITE_RATE_LIMIT_MAX ?? 120);
  const keyPrefix = options.keyPrefix ?? 'write-rate-limit';

  return async (c, next) => {
    if (!writeMethods.has(c.req.method)) {
      await next();
      return;
    }

    const key = `${keyPrefix}:${c.get('userId')}:${c.req.method}:${c.req.path}`;
    let bucket: { count: number; resetAt: number };

    try {
      bucket = await options.store.increment(key, windowMs);
    } catch {
      return c.json(
        {
          error: 'Write rate limiter unavailable.',
          requestId: c.var.requestId,
        },
        503,
      );
    }

    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(Math.max(maxRequests - bucket.count, 0)));
    c.header('X-RateLimit-Reset', new Date(bucket.resetAt).toISOString());

    if (bucket.count > maxRequests) {
      return c.json(
        {
          error: 'Write rate limit exceeded.',
          requestId: c.var.requestId,
          retryAfterSeconds: Math.max(Math.ceil((bucket.resetAt - Date.now()) / 1000), 1),
        },
        429,
      );
    }

    await next();
  };
}
