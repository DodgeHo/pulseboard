import type { MiddlewareHandler } from 'hono';

import { hashApiKey } from '@pulseboard/core';
import { prisma } from '@pulseboard/db';

export { hashApiKey } from '@pulseboard/core';

export type ApiVariables = {
  requestId: string;
  userId: string;
  apiKeyId: string;
};

function readBearerToken(header: string | undefined) {
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

export const apiKeyAuth: MiddlewareHandler<{ Variables: ApiVariables }> = async (c, next) => {
  const token = readBearerToken(c.req.header('authorization')) ?? c.req.header('x-api-key');

  if (!token) {
    return c.json({ error: 'Missing API key.', requestId: c.var.requestId }, 401);
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyHash: hashApiKey(token),
      revokedAt: null,
    },
  });

  if (!apiKey) {
    return c.json({ error: 'Invalid API key.', requestId: c.var.requestId }, 401);
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  c.set('userId', apiKey.userId);
  c.set('apiKeyId', apiKey.id);
  await next();
};
