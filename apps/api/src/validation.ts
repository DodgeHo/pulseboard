import type { ZodSchema } from 'zod';
import type { Context } from 'hono';

import type { ApiVariables } from './auth.js';

export async function parseJson<T>(c: Context<{ Variables: ApiVariables }>, schema: ZodSchema<T>): Promise<T | Response> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Request body must be valid JSON.', requestId: c.var.requestId }, 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return c.json(
      {
        error: 'Validation failed.',
        requestId: c.var.requestId,
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      400,
    );
  }

  return result.data;
}
