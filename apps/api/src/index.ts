import { serve } from '@hono/node-server';

import { createApp } from './app.js';
import { logger } from './logger.js';

const port = Number(process.env.API_PORT ?? 4000);
const app = createApp();

serve({ fetch: app.fetch, port }, (info) => {
  logger.info({ port: info.port }, 'PulseBoard API started');
});

