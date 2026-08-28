import { describe, expect, it } from 'vitest';

import {
  runHttpCheck,
  type HostResolver,
  type PinnedHttpRequester,
  type SafeHttpTarget,
} from '../src/index.js';

const publicResolver: HostResolver = async (hostname) => {
  if (hostname === 'example.com') return [{ address: '93.184.216.34', family: 4 }];
  if (hostname === 'status.example.net') return [{ address: '142.250.72.14', family: 4 }];
  throw new Error(`Unexpected hostname ${hostname}`);
};

function requestInput(url = 'https://example.com') {
  return {
    method: 'GET' as const,
    url,
    expectedStatus: 200,
    timeoutMs: 1000,
  };
}

describe('runHttpCheck', () => {
  it('returns UP and passes a DNS-pinned public target to the HTTP requester', async () => {
    const requestedTargets: SafeHttpTarget[] = [];
    const requester: PinnedHttpRequester = async (target) => {
      requestedTargets.push(target);
      return { statusCode: 200 };
    };

    await expect(
      runHttpCheck(requestInput(), { resolver: publicResolver, requester }),
    ).resolves.toMatchObject({
      status: 'UP',
      statusCode: 200,
      errorMessage: undefined,
    });
    expect(requestedTargets).toHaveLength(1);
    expect(requestedTargets[0]).toMatchObject({
      address: '93.184.216.34',
      family: 4,
    });
  });

  it('returns DOWN when the status code does not match', async () => {
    const requester: PinnedHttpRequester = async () => ({ statusCode: 503 });

    await expect(
      runHttpCheck(requestInput(), { resolver: publicResolver, requester }),
    ).resolves.toMatchObject({
      status: 'DOWN',
      statusCode: 503,
      errorMessage: 'Expected HTTP 200, received HTTP 503.',
    });
  });

  it('returns DOWN when the request fails', async () => {
    const requester: PinnedHttpRequester = async () => {
      throw new Error('network unavailable');
    };

    await expect(
      runHttpCheck({ ...requestInput(), method: 'HEAD' }, { resolver: publicResolver, requester }),
    ).resolves.toMatchObject({
      status: 'DOWN',
      errorMessage: 'network unavailable',
    });
  });

  it.each([
    'http://127.0.0.1',
    'http://2130706433',
    'http://10.0.0.8',
    'http://100.100.100.200',
    'http://169.254.169.254/latest/meta-data',
    'http://192.168.1.20',
    'http://[::1]',
    'http://[fc00::1]',
    'http://[fe80::1]',
    'http://[::ffff:127.0.0.1]',
  ])('rejects non-public literal address %s before making a request', async (url) => {
    let requestCount = 0;
    const requester: PinnedHttpRequester = async () => {
      requestCount += 1;
      return { statusCode: 200 };
    };

    const result = await runHttpCheck(requestInput(url), { requester });

    expect(result.status).toBe('DOWN');
    expect(result.errorMessage).toContain('private, local, reserved, or non-routable');
    expect(requestCount).toBe(0);
  });

  it.each([
    ['http://localhost', 'not an allowed monitoring target'],
    ['http://service.internal/health', 'not an allowed monitoring target'],
    ['http://metadata.google.internal', 'not an allowed monitoring target'],
    ['ftp://example.com/file', 'must use HTTP or HTTPS'],
    ['https://user:secret@example.com', 'must not contain embedded credentials'],
  ])('rejects unsafe target %s', async (url, expectedMessage) => {
    const result = await runHttpCheck(requestInput(url), { resolver: publicResolver });

    expect(result).toMatchObject({ status: 'DOWN' });
    expect(result.errorMessage).toContain(expectedMessage);
  });

  it('rejects a hostname when any DNS answer is non-public', async () => {
    const resolver: HostResolver = async () => [
      { address: '93.184.216.34', family: 4 },
      { address: '10.0.0.5', family: 4 },
    ];
    let requestCount = 0;
    const requester: PinnedHttpRequester = async () => {
      requestCount += 1;
      return { statusCode: 200 };
    };

    const result = await runHttpCheck(requestInput(), { resolver, requester });

    expect(result.status).toBe('DOWN');
    expect(result.errorMessage).toContain('10.0.0.5');
    expect(requestCount).toBe(0);
  });

  it('revalidates redirects and blocks a redirect to a private target', async () => {
    let requestCount = 0;
    const requester: PinnedHttpRequester = async () => {
      requestCount += 1;
      return { statusCode: 302, location: 'http://169.254.169.254/latest/meta-data' };
    };

    const result = await runHttpCheck(requestInput(), { resolver: publicResolver, requester });

    expect(result.status).toBe('DOWN');
    expect(result.errorMessage).toContain('private, local, reserved, or non-routable');
    expect(requestCount).toBe(1);
  });

  it('resolves and pins every public redirect hop independently', async () => {
    const requestedTargets: SafeHttpTarget[] = [];
    const requester: PinnedHttpRequester = async (target) => {
      requestedTargets.push(target);
      if (target.url.hostname === 'example.com') {
        return { statusCode: 302, location: 'https://status.example.net/health' };
      }
      return { statusCode: 200 };
    };

    const result = await runHttpCheck(requestInput(), { resolver: publicResolver, requester });

    expect(result.status).toBe('UP');
    expect(requestedTargets.map((target) => target.address)).toEqual([
      '93.184.216.34',
      '142.250.72.14',
    ]);
  });

  it('applies one timeout budget to DNS resolution and HTTP redirects', async () => {
    const resolver: HostResolver = async () => new Promise(() => undefined);

    const result = await runHttpCheck(
      { ...requestInput(), timeoutMs: 10 },
      { resolver, requester: async () => ({ statusCode: 200 }) },
    );

    expect(result).toMatchObject({
      status: 'DOWN',
      errorMessage: 'Check timed out after 10ms.',
    });
  });
});
