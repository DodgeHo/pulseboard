import type { Context } from 'hono';

import type { ApiVariables } from './auth.js';

export function errorResponse(
  c: Context<{ Variables: ApiVariables }>,
  status: 400 | 401 | 404 | 409 | 429 | 500 | 503,
  error: string,
  extra?: Record<string, unknown>,
) {
  return c.json(
    {
      error,
      requestId: c.var.requestId,
      ...extra,
    },
    status,
  );
}

