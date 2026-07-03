interface ApiEnvelope<T> {
  data: T;
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

interface UptimeCheck {
  id: string;
  serviceId: string;
  name: string;
  url: string;
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
const apiKey = process.env.DEMO_API_KEY ?? 'pb_local_demo_key_change_me';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`PulseBoard API did not become ready within 30s. Last error: ${String(lastError)}`);
}

async function main() {
  await waitForReady();

  const suffix = Date.now().toString(36);
  const workspace = await request<ApiEnvelope<Workspace>>('/v1/workspaces', {
    method: 'POST',
    body: JSON.stringify({
      name: `Demo Workspace ${suffix}`,
      slug: `demo-workspace-${suffix}`,
    }),
  });

  const project = await request<ApiEnvelope<Project>>(`/v1/workspaces/${workspace.data.id}/projects`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Remote Ops Platform',
      slug: `remote-ops-${suffix}`,
      description: 'End-to-end demo project created by scripts/demo-flow.ts.',
    }),
  });

  const service = await request<ApiEnvelope<Service>>(`/v1/projects/${project.data.id}/services`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Public API',
      slug: `public-api-${suffix}`,
      baseUrl: 'https://example.com',
      description: 'A monitored service used by the local demo flow.',
    }),
  });

  const check = await request<ApiEnvelope<UptimeCheck>>(`/v1/services/${service.data.id}/uptime-checks`, {
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
  });

  const event = await request<ApiEnvelope<WebhookEvent>>('/v1/webhooks/events', {
    method: 'POST',
    body: JSON.stringify({
      workspaceId: workspace.data.id,
      source: 'demo-script',
      eventType: 'deployment.finished',
      externalId: `deploy-${suffix}`,
      payload: {
        service: service.data.slug,
        version: '2026.07.local',
        status: 'succeeded',
      },
    }),
  });

  const auditLogs = await request<ApiEnvelope<AuditLog[]>>(`/v1/audit-logs?workspaceId=${workspace.data.id}`);
  const usageMetrics = await request<ApiEnvelope<UsageMetric[]>>(`/v1/usage-metrics?workspaceId=${workspace.data.id}`);
  const incidents = await request<ApiEnvelope<unknown[]>>('/v1/incidents');

  console.log(
    JSON.stringify(
      {
        workspace: workspace.data,
        project: project.data,
        service: service.data,
        uptimeCheck: check.data,
        webhookEvent: event.data,
        usageMetricCount: usageMetrics.data.length,
        auditLogCount: auditLogs.data.length,
        incidentCount: incidents.data.length,
        docs: `${baseUrl}/docs`,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
