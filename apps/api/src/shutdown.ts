export class ShutdownDeadlineExceededError extends Error {
  constructor(timeoutMs: number) {
    super(`API shutdown exceeded ${timeoutMs}ms.`);
    this.name = 'ShutdownDeadlineExceededError';
  }
}

interface ClosableHttpServer {
  close(callback: (error?: Error) => void): unknown;
}

export function closeHttpServer(server: ClosableHttpServer) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export function createBoundedShutdown(options: {
  timeoutMs: number;
  close: () => Promise<void>;
  forceClose?: () => void;
  onStart?: (signal: NodeJS.Signals) => void;
}) {
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error('Shutdown timeout must be a positive finite number.');
  }

  let inFlight: Promise<void> | null = null;

  return (signal: NodeJS.Signals) => {
    if (inFlight) return inFlight;

    options.onStart?.(signal);
    const closePromise = (async () => options.close())();

    inFlight = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        try {
          options.forceClose?.();
        } finally {
          reject(new ShutdownDeadlineExceededError(options.timeoutMs));
        }
      }, options.timeoutMs);

      void closePromise.then(
        () => {
          clearTimeout(timeout);
          resolve();
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      );
    });

    return inFlight;
  };
}
