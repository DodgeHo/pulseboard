export class WorkerShutdownDeadlineExceededError extends Error {
  constructor(timeoutMs: number) {
    super(`Worker shutdown exceeded ${timeoutMs}ms.`);
    this.name = 'WorkerShutdownDeadlineExceededError';
  }
}

interface WorkerCloser {
  close(force?: boolean): Promise<void>;
}

export async function closeWorkerResources(options: {
  workers: WorkerCloser[];
  closeAfterWorkers: Array<() => Promise<unknown>>;
}) {
  const workerResults = await Promise.allSettled(options.workers.map((worker) => worker.close()));
  const resourceResults = await Promise.allSettled(options.closeAfterWorkers.map((close) => close()));
  const failures = [...workerResults, ...resourceResults]
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => result.reason);

  if (failures.length > 0) {
    throw new AggregateError(failures, 'One or more worker resources failed to close.');
  }
}

export function createBoundedWorkerShutdown(options: {
  timeoutMs: number;
  close: () => Promise<void>;
  forceClose: () => void;
  onStart?: (signal: NodeJS.Signals) => void;
}) {
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error('Worker shutdown timeout must be a positive finite number.');
  }

  let inFlight: Promise<void> | null = null;

  return (signal: NodeJS.Signals) => {
    if (inFlight) return inFlight;

    options.onStart?.(signal);
    const closePromise = (async () => options.close())();

    inFlight = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        try {
          options.forceClose();
        } finally {
          reject(new WorkerShutdownDeadlineExceededError(options.timeoutMs));
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
