import { describe, expect, it, vi } from 'vitest';

import {
  closeHttpServer,
  createBoundedShutdown,
  ShutdownDeadlineExceededError,
} from '../src/shutdown.js';

describe('API shutdown', () => {
  it('closes the HTTP server through its callback contract', async () => {
    const close = vi.fn((callback: (error?: Error) => void) => callback());

    await closeHttpServer({ close });

    expect(close).toHaveBeenCalledOnce();
  });

  it('coalesces repeated signals into one graceful close', async () => {
    let release: (() => void) | undefined;
    const close = vi.fn(() => new Promise<void>((resolve) => {
      release = resolve;
    }));
    const onStart = vi.fn();
    const shutdown = createBoundedShutdown({ timeoutMs: 1_000, close, onStart });

    const first = shutdown('SIGTERM');
    const second = shutdown('SIGINT');
    expect(second).toBe(first);
    expect(close).toHaveBeenCalledOnce();
    expect(onStart).toHaveBeenCalledOnce();

    release?.();
    await first;
  });

  it('forces connection closure and fails when the deadline expires', async () => {
    const forceClose = vi.fn();
    const shutdown = createBoundedShutdown({
      timeoutMs: 20,
      close: () => new Promise<void>(() => undefined),
      forceClose,
    });

    await expect(shutdown('SIGTERM')).rejects.toBeInstanceOf(ShutdownDeadlineExceededError);
    expect(forceClose).toHaveBeenCalledOnce();
  });
});
