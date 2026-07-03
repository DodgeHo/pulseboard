import { afterEach, describe, expect, it, vi } from 'vitest';

import { runHttpCheck } from '../src/http-check.js';

describe('runHttpCheck', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns UP when the expected status matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 200 })),
    );

    await expect(
      runHttpCheck({
        method: 'GET',
        url: 'https://example.com',
        expectedStatus: 200,
        timeoutMs: 1000,
      }),
    ).resolves.toMatchObject({
      status: 'UP',
      statusCode: 200,
      errorMessage: undefined,
    });
  });

  it('returns DOWN when the status code does not match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 503 })),
    );

    await expect(
      runHttpCheck({
        method: 'GET',
        url: 'https://example.com',
        expectedStatus: 200,
        timeoutMs: 1000,
      }),
    ).resolves.toMatchObject({
      status: 'DOWN',
      statusCode: 503,
      errorMessage: 'Expected HTTP 200, received HTTP 503.',
    });
  });

  it('returns DOWN when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network unavailable');
      }),
    );

    await expect(
      runHttpCheck({
        method: 'HEAD',
        url: 'https://example.com',
        expectedStatus: 200,
        timeoutMs: 1000,
      }),
    ).resolves.toMatchObject({
      status: 'DOWN',
      errorMessage: 'network unavailable',
    });
  });
});

