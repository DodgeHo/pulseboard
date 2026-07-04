import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

import type { ApiVariables } from '../src/auth.js';
import type { RateLimitStore } from '../src/rate-limit.js';
import { createWriteRateLimit } from '../src/rate-limit.js';

function createTestApp(store: RateLimitStore) {
  const app = new Hono<{ Variables: ApiVariables }>();

  app.use('*', async (c, next) => {
    c.set('requestId', 'rate-limit-test-request');
    c.set('userId', 'user_1');
    c.set('apiKeyId', 'key_1');
    await next();
  });
  app.use('*', createWriteRateLimit({ store, maxRequests: 2, windowMs: 60_000 }));
  app.get('/v1/workspaces', (c) => c.json({ data: [] }));
  app.post('/v1/workspaces', (c) => c.json({ data: { ok: true } }, 201));

  return app;
}

describe('write rate limiter', () => {
  it('does not rate limit read requests', async () => {
    const app = createTestApp({
      async increment() {
        throw new Error('store should not be called for GET requests');
      },
    });

    const response = await app.request('/v1/workspaces');

    expect(response.status).toBe(200);
    expect(response.headers.get('X-RateLimit-Limit')).toBeNull();
  });

  it('sets rate limit headers and rejects writes over the limit', async () => {
    const counts = new Map<string, number>();
    const app = createTestApp({
      async increment(key, windowMs) {
        const count = (counts.get(key) ?? 0) + 1;
        counts.set(key, count);
        return { count, resetAt: Date.now() + windowMs };
      },
    });

    const first = await app.request('/v1/workspaces', { method: 'POST' });
    const second = await app.request('/v1/workspaces', { method: 'POST' });
    const third = await app.request('/v1/workspaces', { method: 'POST' });

    expect(first.status).toBe(201);
    expect(first.headers.get('X-RateLimit-Limit')).toBe('2');
    expect(first.headers.get('X-RateLimit-Remaining')).toBe('1');
    expect(second.status).toBe(201);
    expect(second.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(third.status).toBe(429);
    await expect(third.json()).resolves.toMatchObject({
      error: 'Write rate limit exceeded.',
      requestId: 'rate-limit-test-request',
    });
  });

  it('returns 503 when the backing store is unavailable', async () => {
    const app = createTestApp({
      async increment() {
        throw new Error('redis unavailable');
      },
    });

    const response = await app.request('/v1/workspaces', { method: 'POST' });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Write rate limiter unavailable.',
      requestId: 'rate-limit-test-request',
    });
  });
});
