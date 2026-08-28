import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import type { LookupFunction } from 'node:net';

import type { CheckOutcome } from './incident-policy.js';
import {
  resolveSafeHttpTarget,
  type HostResolver,
  type SafeHttpTarget,
} from './url-safety.js';

export interface HttpCheckRequest {
  method: 'GET' | 'HEAD';
  url: string;
  expectedStatus: number;
  timeoutMs: number;
}

export interface HttpCheckResult {
  status: CheckOutcome;
  statusCode?: number;
  latencyMs?: number;
  errorMessage?: string;
}

export interface PinnedHttpResponse {
  statusCode: number;
  location?: string;
}

export type PinnedHttpRequester = (
  target: SafeHttpTarget,
  method: HttpCheckRequest['method'],
  signal: AbortSignal,
) => Promise<PinnedHttpResponse>;

export interface HttpCheckDependencies {
  resolver?: HostResolver;
  requester?: PinnedHttpRequester;
}

const maxRedirects = 3;

const redirectStatuses = new Set([301, 302, 303, 307, 308]);

const requestPinnedTarget: PinnedHttpRequester = (target, method, signal) => {
  const lookupPinnedAddress: LookupFunction = (_hostname, options, callback) => {
    if (options.all) {
      callback(null, [{ address: target.address, family: target.family }], target.family);
      return;
    }
    callback(null, target.address, target.family);
  };

  return new Promise((resolve, reject) => {
    const request = (target.url.protocol === 'https:' ? httpsRequest : httpRequest)(
      target.url,
      {
        method,
        signal,
        lookup: lookupPinnedAddress,
        headers: {
          Accept: '*/*',
          'User-Agent': 'PulseBoard-Uptime-Check/1.0',
        },
      },
      (response) => {
        const statusCode = response.statusCode;
        const location = response.headers.location;
        response.destroy();

        if (statusCode === undefined) {
          reject(new Error('Monitoring target returned no HTTP status code.'));
          return;
        }

        resolve({ statusCode, location });
      },
    );

    request.once('error', reject);
    request.end();
  });
};

export async function runHttpCheck(
  request: HttpCheckRequest,
  dependencies: HttpCheckDependencies = {},
): Promise<HttpCheckResult> {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error(`Check timed out after ${request.timeoutMs}ms.`)),
    request.timeoutMs,
  );

  try {
    let currentUrl = request.url;

    for (let redirectCount = 0; ; redirectCount += 1) {
      const target = await resolveSafeHttpTarget(currentUrl, {
        resolver: dependencies.resolver,
        signal: controller.signal,
      });
      const response = await (dependencies.requester ?? requestPinnedTarget)(
        target,
        request.method,
        controller.signal,
      );

      if (redirectStatuses.has(response.statusCode) && response.location) {
        if (redirectCount >= maxRedirects) {
          throw new Error(`Monitoring target exceeded the ${maxRedirects}-redirect limit.`);
        }
        currentUrl = new URL(response.location, target.url).toString();
        continue;
      }

      const latencyMs = Math.round(performance.now() - startedAt);
      const status = response.statusCode === request.expectedStatus ? 'UP' : 'DOWN';

      return {
        status,
        statusCode: response.statusCode,
        latencyMs,
        errorMessage:
          status === 'DOWN'
            ? `Expected HTTP ${request.expectedStatus}, received HTTP ${response.statusCode}.`
            : undefined,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown check error';
    return {
      status: 'DOWN',
      latencyMs: Math.round(performance.now() - startedAt),
      errorMessage: controller.signal.aborted
        ? `Check timed out after ${request.timeoutMs}ms.`
        : message,
    };
  } finally {
    clearTimeout(timeout);
  }
}
