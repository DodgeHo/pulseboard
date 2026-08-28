import { describe, expect, it, vi } from 'vitest';

import {
  closeWorkerResources,
  createBoundedWorkerShutdown,
  WorkerShutdownDeadlineExceededError,
} from '../src/shutdown.js';

describe('worker shutdown', () => {
  it('starts worker drains concurrently before closing shared resources', async () => {
    let releaseFirst: (() => void) | undefined;
    let releaseSecond: (() => void) | undefined;
    const first = { close: vi.fn(() => new Promise<void>((resolve) => { releaseFirst = resolve; })) };
    const second = { close: vi.fn(() => new Promise<void>((resolve) => { releaseSecond = resolve; })) };
    const closeQueue = vi.fn(async () => undefined);

    const closing = closeWorkerResources({
      workers: [first, second],
      closeAfterWorkers: [closeQueue],
    });

    expect(first.close).toHaveBeenCalledOnce();
    expect(second.close).toHaveBeenCalledOnce();
    expect(closeQueue).not.toHaveBeenCalled();

    releaseFirst?.();
    releaseSecond?.();
    await closing;
    expect(closeQueue).toHaveBeenCalledOnce();
  });

  it('attempts every cleanup and reports aggregate failures', async () => {
    const closeQueue = vi.fn().mockRejectedValue(new Error('queue close failed'));
    const disconnectDatabase = vi.fn(async () => undefined);

    await expect(closeWorkerResources({
      workers: [{ close: vi.fn().mockRejectedValue(new Error('worker close failed')) }],
      closeAfterWorkers: [closeQueue, disconnectDatabase],
    })).rejects.toBeInstanceOf(AggregateError);

    expect(closeQueue).toHaveBeenCalledOnce();
    expect(disconnectDatabase).toHaveBeenCalledOnce();
  });

  it('coalesces repeated signals into one graceful drain', async () => {
    let release: (() => void) | undefined;
    const close = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    const forceClose = vi.fn();
    const onStart = vi.fn();
    const shutdown = createBoundedWorkerShutdown({
      timeoutMs: 1_000,
      close,
      forceClose,
      onStart,
    });

    const first = shutdown('SIGTERM');
    const second = shutdown('SIGINT');
    expect(second).toBe(first);
    expect(close).toHaveBeenCalledOnce();
    expect(onStart).toHaveBeenCalledOnce();

    release?.();
    await first;
    expect(forceClose).not.toHaveBeenCalled();
  });

  it('force-closes workers and fails when the deadline expires', async () => {
    const forceClose = vi.fn();
    const shutdown = createBoundedWorkerShutdown({
      timeoutMs: 20,
      close: () => new Promise<void>(() => undefined),
      forceClose,
    });

    await expect(shutdown('SIGTERM')).rejects.toBeInstanceOf(WorkerShutdownDeadlineExceededError);
    expect(forceClose).toHaveBeenCalledOnce();
  });
});
