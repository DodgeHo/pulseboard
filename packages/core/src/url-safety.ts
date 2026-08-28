import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

export interface ResolvedAddress {
  address: string;
  family: 4 | 6;
}

export type HostResolver = (hostname: string) => Promise<readonly ResolvedAddress[]>;

export interface SafeHttpTarget {
  url: URL;
  address: string;
  family: 4 | 6;
}

export interface ResolveSafeHttpTargetOptions {
  resolver?: HostResolver;
  signal?: AbortSignal;
}

export class UnsafeHttpUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeHttpUrlError';
  }
}

const blockedHostnames = new Set([
  'instance-data',
  'localhost',
  'localhost.localdomain',
  'metadata',
  'metadata.azure.internal',
  'metadata.google.internal',
]);

const blockedHostnameSuffixes = ['.home.arpa', '.internal', '.local', '.localhost'];

const blockedIpv4 = new BlockList();
blockedIpv4.addSubnet('0.0.0.0', 8, 'ipv4');
blockedIpv4.addSubnet('10.0.0.0', 8, 'ipv4');
blockedIpv4.addSubnet('100.64.0.0', 10, 'ipv4');
blockedIpv4.addSubnet('127.0.0.0', 8, 'ipv4');
blockedIpv4.addSubnet('169.254.0.0', 16, 'ipv4');
blockedIpv4.addSubnet('172.16.0.0', 12, 'ipv4');
blockedIpv4.addSubnet('192.0.0.0', 24, 'ipv4');
blockedIpv4.addSubnet('192.0.2.0', 24, 'ipv4');
blockedIpv4.addSubnet('192.88.99.0', 24, 'ipv4');
blockedIpv4.addSubnet('192.168.0.0', 16, 'ipv4');
blockedIpv4.addSubnet('198.18.0.0', 15, 'ipv4');
blockedIpv4.addSubnet('198.51.100.0', 24, 'ipv4');
blockedIpv4.addSubnet('203.0.113.0', 24, 'ipv4');
blockedIpv4.addSubnet('224.0.0.0', 4, 'ipv4');
blockedIpv4.addSubnet('240.0.0.0', 4, 'ipv4');

const blockedIpv6 = new BlockList();
blockedIpv6.addSubnet('::', 128, 'ipv6');
blockedIpv6.addSubnet('::1', 128, 'ipv6');
blockedIpv6.addSubnet('::ffff:0:0', 96, 'ipv6');
blockedIpv6.addSubnet('64:ff9b:1::', 48, 'ipv6');
blockedIpv6.addSubnet('100::', 64, 'ipv6');
blockedIpv6.addSubnet('2001:2::', 48, 'ipv6');
blockedIpv6.addSubnet('2001:db8::', 32, 'ipv6');
blockedIpv6.addSubnet('fc00::', 7, 'ipv6');
blockedIpv6.addSubnet('fe80::', 10, 'ipv6');
blockedIpv6.addSubnet('ff00::', 8, 'ipv6');

function normalizeHostname(hostname: string) {
  const withoutIpv6Brackets = hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;
  return withoutIpv6Brackets.toLowerCase().replace(/\.+$/, '');
}

function assertAllowedHostname(hostname: string) {
  const normalized = normalizeHostname(hostname);
  if (
    blockedHostnames.has(normalized) ||
    blockedHostnameSuffixes.some((suffix) => normalized.endsWith(suffix))
  ) {
    throw new UnsafeHttpUrlError(`Host ${hostname} is not an allowed monitoring target.`);
  }
}

function assertPublicAddress(address: ResolvedAddress) {
  const actualFamily = isIP(address.address);
  if (actualFamily !== address.family) {
    throw new UnsafeHttpUrlError('DNS returned an invalid address for the monitoring target.');
  }

  const isBlocked =
    address.family === 4
      ? blockedIpv4.check(address.address, 'ipv4')
      : blockedIpv6.check(address.address, 'ipv6');

  if (isBlocked) {
    throw new UnsafeHttpUrlError(
      `Host resolves to a private, local, reserved, or non-routable address (${address.address}).`,
    );
  }
}

async function defaultResolver(hostname: string): Promise<readonly ResolvedAddress[]> {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  return addresses.map(({ address, family }) => ({ address, family: family as 4 | 6 }));
}

function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(signal.reason ?? new Error('The operation was aborted.'));

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason ?? new Error('The operation was aborted.'));
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

export function parseAndValidateHttpUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeHttpUrlError('Monitoring target must be a valid absolute URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeHttpUrlError('Monitoring target must use HTTP or HTTPS.');
  }
  if (url.username || url.password) {
    throw new UnsafeHttpUrlError('Monitoring target must not contain embedded credentials.');
  }
  if (!url.hostname) {
    throw new UnsafeHttpUrlError('Monitoring target must include a hostname.');
  }

  assertAllowedHostname(url.hostname);
  return url;
}

export async function resolveSafeHttpTarget(
  rawUrl: string,
  options: ResolveSafeHttpTargetOptions = {},
): Promise<SafeHttpTarget> {
  const url = parseAndValidateHttpUrl(rawUrl);
  const hostname = normalizeHostname(url.hostname);
  const literalFamily = isIP(hostname);

  let addresses: readonly ResolvedAddress[];
  if (literalFamily === 4 || literalFamily === 6) {
    addresses = [{ address: hostname, family: literalFamily }];
  } else {
    try {
      addresses = await abortable((options.resolver ?? defaultResolver)(hostname), options.signal);
    } catch (error) {
      if (options.signal?.aborted) throw error;
      const message = error instanceof Error ? error.message : 'unknown DNS error';
      throw new UnsafeHttpUrlError(`Monitoring target could not be resolved safely: ${message}`);
    }
  }

  if (addresses.length === 0) {
    throw new UnsafeHttpUrlError('Monitoring target did not resolve to an IP address.');
  }

  for (const address of addresses) assertPublicAddress(address);

  const selected = addresses[0];
  if (!selected) throw new UnsafeHttpUrlError('Monitoring target did not resolve to an IP address.');

  return { url, address: selected.address, family: selected.family };
}
