import { randomUUID } from 'node:crypto';

import type { MiddlewareHandler } from 'hono';

import type { ApiVariables } from './auth.js';
import { logger } from './logger.js';

export const requestContext: MiddlewareHandler<{ Variables: ApiVariables }> = async (c, next) => {
  const requestId = c.req.header('x-request-id') || randomUUID();
  const startedAt = performance.now();

  c.set('requestId', requestId);
  c.header('X-Request-Id', requestId);

  try {
    await next();
  } finally {
    const durationMs = Math.round(performance.now() - startedAt);
    logger.info(
      {
        requestId,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs,
        userId: c.var.userId,
      },
      'http request completed',
    );
  }
};

