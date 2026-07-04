interface ApiEnvelope<T> {
  data: T;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  key?: string;
  revokedAt?: string | null;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
}

interface Service {
  id: string;
  projectId: string;
  name: string;
  slug: string;
}

interface CheckRun {
  id: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  statusCode?: number;
  latencyMs?: number;
}

interface UptimeCheck {
  id: string;
  serviceId: string;
  name: string;
  url: string;
  checkRuns?: CheckRun[];
}

interface Incident {
  id: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  title: string;
  severity: string;
}

interface WebhookEvent {
  id: string;
  eventType: string;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  message: string;
}

interface UsageMetric {
  id: string;
  name: string;
  value: number;
}

const baseUrl = process.env.PULSEBOARD_API_URL ?? 'http://localhost:4000';
const demoApiKey = process.env.DEMO_API_KEY ?? 'pb_local_demo_key_change_me';

function logStep(title: string) {
  console.log(`\n== ${title}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, init: RequestInit = {}, token = demoApiKey): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} failed with ${response.status}: ${text}`);
  }

  return body as T;
}

async function waitForReady() {
  const deadline = Date.now() + 30_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health/ready`);
      if (response.ok) return;
      lastError = await response.text();
    } catch (error) {
      lastError = error;
    }
    await sleep(1000);
  }

  throw new Error(`PulseBoard API did not become ready within 30s. Last error: ${String(lastError)}`);
}

async function waitForCheckRun(checkId: string, token: string) {
  const deadline = Date.now() + 45_000;
  let latest: UptimeCheck | null = null;

  while (Date.now() < deadline) {
    latest = (await request<ApiEnvelope<UptimeCheck>>(`/v1/uptime-checks/${checkId}`, {}, token)).data;
    if ((latest.checkRuns?.length ?? 0) > 0) return latest.checkRuns?.[0];
    await sleep(1500);
  }

  throw new Error(`Worker did not record a check run for ${checkId} within 45s.`);
}

async function waitForOpenIncident(token: string) {
  const deadline = Date.now() + 45_000;

  while (Date.now() < deadline) {
    const incidents = (await request<ApiEnvelope<Incident[]>>('/v1/incidents?status=OPEN', {}, token)).data;
    const incident = incidents.find((item) => item.title.includes('Intentional failure probe'));
    if (incident) return incident;
    await sleep(1500);
  }

  throw new Error('Worker did not open the expected incident within 45s.');
}

async function main() {
  logStep('Readiness');
  await waitForReady();
  console.log(`API ready at ${baseUrl}`);

  const suffix = Date.now().toString(36);

  logStep('API key rotation');
  const temporaryKey = (
    await request<ApiEnvelope<ApiKey>>('/v1/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name: `Demo flow key ${suffix}` }),
    })
  ).data;
  if (!temporaryKey.key) throw new Error('API did not return the one-time plaintext API key.');
  console.log(`Created temporary API key ${temporaryKey.id} with prefix ${temporaryKey.prefix}`);

  const token = temporaryKey.key;

  logStep('Tenant setup');
  const workspace = (
    await request<ApiEnvelope<Workspace>>(
      '/v1/workspaces',
      {
        method: 'POST',
        body: JSON.stringify({
          name: `Demo Workspace ${suffix}`,
          slug: `demo-workspace-${suffix}`,
        }),
      },
      token,
    )
  ).data;
  console.log(`Workspace: ${workspace.name} (${workspace.id})`);

  const project = (
    await request<ApiEnvelope<Project>>(
      `/v1/workspaces/${workspace.id}/projects`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Remote Ops Platform',
          slug: `remote-ops-${suffix}`,
          description: 'End-to-end demo project created by scripts/demo-flow.ts.',
        }),
      },
      token,
    )
  ).data;
  console.log(`Project: ${project.name} (${project.id})`);

  const service = (
    await request<ApiEnvelope<Service>>(
      `/v1/projects/${project.id}/services`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Public API',
          slug: `public-api-${suffix}`,
          baseUrl: 'https://example.com',
          description: 'A monitored service used by the local demo flow.',
        }),
      },
      token,
    )
  ).data;
  console.log(`Service: ${service.name} (${service.id})`);

  logStep('Worker-backed uptime checks');
  const healthyCheck = (
    await request<ApiEnvelope<UptimeCheck>>(
      `/v1/services/${service.id}/uptime-checks`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Example homepage',
          url: 'https://example.com',
          expectedStatus: 200,
          intervalSeconds: 60,
          timeoutMs: 5000,
          consecutiveFailuresToOpen: 2,
          consecutiveSuccessesToResolve: 1,
        }),
      },
      token,
    )
  ).data;
  const healthyRun = await waitForCheckRun(healthyCheck.id, token);
  console.log(`Healthy check run: ${healthyRun?.status} HTTP ${healthyRun?.statusCode ?? 'n/a'} in ${healthyRun?.latencyMs ?? 'n/a'}ms`);

  const failingCheck = (
    await request<ApiEnvelope<UptimeCheck>>(
      `/v1/services/${service.id}/uptime-checks`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Intentional failure probe',
          url: 'https://example.com',
          expectedStatus: 500,
          intervalSeconds: 60,
          timeoutMs: 5000,
          consecutiveFailuresToOpen: 1,
          consecutiveSuccessesToResolve: 1,
        }),
      },
      token,
    )
  ).data;
  const failingRun = await waitForCheckRun(failingCheck.id, token);
  console.log(`Failure check run: ${failingRun?.status} HTTP ${failingRun?.statusCode ?? 'n/a'}`);

  const incident = await waitForOpenIncident(token);
  console.log(`Incident opened: ${incident.title} (${incident.status}, ${incident.severity})`);

  logStep('Webhook and operational history');
  const event = (
    await request<ApiEnvelope<WebhookEvent>>(
      '/v1/webhooks/events',
      {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: workspace.id,
          source: 'demo-script',
          eventType: 'deployment.finished',
          externalId: `deploy-${suffix}`,
          payload: {
            service: service.slug,
            version: '2026.07.local',
            status: 'succeeded',
          },
        }),
      },
      token,
    )
  ).data;
  console.log(`Webhook stored: ${event.eventType} (${event.id})`);

  const auditLogs = (await request<ApiEnvelope<AuditLog[]>>(`/v1/audit-logs?workspaceId=${workspace.id}`, {}, token)).data;
  const usageMetrics = (await request<ApiEnvelope<UsageMetric[]>>(`/v1/usage-metrics?workspaceId=${workspace.id}`, {}, token)).data;
  const metricNames = [...new Set(usageMetrics.map((metric) => metric.name))].sort();
  const auditActions = [...new Set(auditLogs.map((log) => log.action))].sort();

  console.log(`Audit actions: ${auditActions.join(', ')}`);
  console.log(`Usage metrics: ${metricNames.join(', ')}`);

  logStep('Cleanup');
  const revoked = (
    await request<ApiEnvelope<ApiKey>>(`/v1/api-keys/${temporaryKey.id}`, {
      method: 'DELETE',
    })
  ).data;
  console.log(`Revoked temporary API key ${revoked.id}`);

  console.log('\nDemo flow completed successfully.');
  console.log(`API docs: ${baseUrl}/docs`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
