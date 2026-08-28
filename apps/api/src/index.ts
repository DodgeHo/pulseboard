import { serve } from '@hono/node-server';
import { assertApiKeyHashConfiguration } from '@pulseboard/core';
import { prisma } from '@pulseboard/db';
import type { Server } from 'node:http';

import { closeAppResources, createApp } from './app.js';
import { logger } from './logger.js';
import { closeHttpServer, createBoundedShutdown } from './shutdown.js';

assertApiKeyHashConfiguration();

const port = Number(process.env.API_PORT ?? 4000);
const shutdownTimeoutMs = Number(process.env.API_SHUTDOWN_TIMEOUT_MS ?? 10_000);
let draining = false;
const app = createApp({ isDraining: () => draining });

const server = serve({ fetch: app.fetch, port }, (info) => {
  logger.info({ port: info.port }, 'PulseBoard API started');
}) as Server;

const shutdown = createBoundedShutdown({
  timeoutMs: shutdownTimeoutMs,
  onStart: (signal) => {
    draining = true;
    logger.info({ signal, shutdownTimeoutMs }, 'shutting down PulseBoard API');
  },
  close: async () => {
    await closeHttpServer(server);
    await closeAppResources();
    await prisma.$disconnect();
  },
  forceClose: () => server.closeAllConnections(),
});

function handleSignal(signal: NodeJS.Signals) {
  void shutdown(signal).then(
    () => {
      logger.info({ signal }, 'PulseBoard API stopped');
      process.exitCode = 0;
    },
    (error) => {
      logger.error({ error, signal }, 'PulseBoard API shutdown failed');
      process.exit(1);
    },
  );
}

process.once('SIGINT', () => handleSignal('SIGINT'));
process.once('SIGTERM', () => handleSignal('SIGTERM'));
