import type { CheckOutcome } from './incident-policy.js';

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

export async function runHttpCheck(request: HttpCheckRequest): Promise<HttpCheckResult> {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), request.timeoutMs);

  try {
    const response = await fetch(request.url, {
      method: request.method,
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - startedAt);
    const status = response.status === request.expectedStatus ? 'UP' : 'DOWN';

    return {
      status,
      statusCode: response.status,
      latencyMs,
      errorMessage:
        status === 'DOWN'
          ? `Expected HTTP ${request.expectedStatus}, received HTTP ${response.status}.`
          : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown check error';
    return {
      status: 'DOWN',
      latencyMs: Math.round(performance.now() - startedAt),
      errorMessage: message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

