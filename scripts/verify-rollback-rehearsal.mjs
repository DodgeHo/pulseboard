const baseUrl = process.env.PULSEBOARD_REHEARSAL_BASE_URL ?? 'http://edge:8080';
const apiKey = process.env.DEMO_API_KEY;
const expectedRelease = process.env.EXPECTED_RELEASE;
const expectedContract = process.env.EXPECTED_CONTRACT;
const phase = process.env.REHEARSAL_PHASE;
const sentinelSlug = process.env.SENTINEL_SLUG;
const candidateDescription = process.env.CANDIDATE_DESCRIPTION;

if (
  !apiKey ||
  !expectedRelease ||
  !expectedContract ||
  !phase ||
  !sentinelSlug ||
  !candidateDescription
) {
  throw new Error(
    'DEMO_API_KEY, EXPECTED_RELEASE, EXPECTED_CONTRACT, REHEARSAL_PHASE, SENTINEL_SLUG, and CANDIDATE_DESCRIPTION are required.',
  );
}

if (!['baseline', 'candidate', 'rollback'].includes(phase)) {
  throw new Error(`Unsupported REHEARSAL_PHASE: ${phase}.`);
}

const projectSlug = `${sentinelSlug}-project`;
const serviceSlug = `${sentinelSlug}-service`;
const checkName = 'Rollback compatibility check';

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} returned ${response.status}: ${body.slice(0, 500)}`);
  }
  return { response, body };
}

function parseJson(path, body) {
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error(`${path} did not return valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requestJson(path, init = {}) {
  const result = await request(path, init);
  return parseJson(path, result.body);
}

const publicPage = await request('/demo/');
assert(publicPage.body.includes('PulseBoard'), '/demo/ did not contain the PulseBoard public surface.');

const docsPage = await request('/demo/docs');
assert(docsPage.body.toLowerCase().includes('<!doctype html'), '/demo/docs did not return HTML.');

const openApi = await requestJson('/demo/openapi.json');
assert(typeof openApi.openapi === 'string', '/demo/openapi.json did not contain an OpenAPI version.');

const live = await requestJson('/demo/health/live');
assert(live.status === 'ok', `/demo/health/live reported ${String(live.status)}.`);
assert(
  live.release === expectedRelease,
  `/demo/health/live reported release ${String(live.release)} instead of ${expectedRelease}.`,
);
assert(
  live.contract === expectedContract,
  `/demo/health/live reported contract ${String(live.contract)} instead of ${expectedContract}.`,
);

const ready = await requestJson('/demo/health/ready');
assert(ready.status === 'ready', `/demo/health/ready reported ${String(ready.status)}.`);

const authHeaders = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
};

if (phase === 'baseline') {
  const workspace = (
    await requestJson('/demo/api/v1/workspaces', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Rollback Rehearsal Sentinel', slug: sentinelSlug }),
    })
  ).data;
  assert(workspace?.slug === sentinelSlug, 'The durable sentinel workspace was not created.');

  const project = (
    await requestJson(`/demo/api/v1/workspaces/${workspace.id}/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Rollback Sentinel Project', slug: projectSlug }),
    })
  ).data;
  assert(project?.slug === projectSlug, 'The durable sentinel project was not created.');

  const service = (
    await requestJson(`/demo/api/v1/projects/${project.id}/services`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Rollback Sentinel Service',
        slug: serviceSlug,
        baseUrl: 'https://example.com',
      }),
    })
  ).data;
  assert(service?.slug === serviceSlug, 'The durable sentinel service was not created.');

  const check = (
    await requestJson(`/demo/api/v1/services/${service.id}/uptime-checks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: checkName,
        url: 'https://example.com',
        intervalSeconds: 86_400,
      }),
    })
  ).data;
  assert(check?.name === checkName, 'The baseline uptime check was not created.');
  assert(
    !Object.hasOwn(check, 'description'),
    'The baseline contract unexpectedly exposed the candidate-only description field.',
  );
}

const workspacePayload = await requestJson('/demo/api/v1/workspaces', { headers: authHeaders });
const workspace = workspacePayload.data?.find((item) => item.slug === sentinelSlug);
assert(workspace, `Workspace ${sentinelSlug} was not visible through the authenticated API.`);

const projectPayload = await requestJson(`/demo/api/v1/workspaces/${workspace.id}/projects`, { headers: authHeaders });
const project = projectPayload.data?.find((item) => item.slug === projectSlug);
assert(project, `Project ${projectSlug} was not preserved.`);

const servicePayload = await requestJson(`/demo/api/v1/projects/${project.id}/services`, { headers: authHeaders });
const service = servicePayload.data?.find((item) => item.slug === serviceSlug);
assert(service, `Service ${serviceSlug} was not preserved.`);

const checkPayload = await requestJson(`/demo/api/v1/services/${service.id}/uptime-checks`, { headers: authHeaders });
let check = checkPayload.data?.find((item) => item.name === checkName);
assert(check, `Uptime check ${checkName} was not preserved.`);

if (phase === 'candidate') {
  const updated = (
    await requestJson(`/demo/api/v1/uptime-checks/${check.id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ description: candidateDescription }),
    })
  ).data;
  assert(updated.description === candidateDescription, 'The candidate contract did not persist the expanded field.');
  check = updated;
}

if (phase === 'rollback') {
  assert(
    !Object.hasOwn(check, 'description'),
    'The rolled-back baseline contract unexpectedly selected the candidate-only field.',
  );
  const updated = (
    await requestJson(`/demo/api/v1/uptime-checks/${check.id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ expectedStatus: 204 }),
    })
  ).data;
  assert(updated.expectedStatus === 204, 'The rolled-back baseline contract could not update an existing field.');
  assert(
    !Object.hasOwn(updated, 'description'),
    'The rolled-back baseline update unexpectedly exposed the candidate-only field.',
  );
  check = updated;
}

if (phase === 'candidate') {
  assert(check.description === candidateDescription, 'The candidate list response did not expose the expanded field.');
} else {
  assert(
    !Object.hasOwn(check, 'description'),
    `The ${phase} contract unexpectedly exposed the candidate-only field.`,
  );
}

const auditPayload = await requestJson(
  `/demo/api/v1/audit-logs?workspaceId=${encodeURIComponent(workspace.id)}`,
  { headers: authHeaders },
);
assert(
  auditPayload.data?.some(
    (event) => event.entityType === 'workspace' && event.entityId === workspace.id && event.action === 'CREATED',
  ),
  'The sentinel workspace audit event was not preserved.',
);

process.stdout.write(
  `${JSON.stringify(
    {
      phase,
      release: live.release,
      contract: live.contract,
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug,
      projectId: project.id,
      serviceId: service.id,
      uptimeCheckId: check.id,
      expectedStatus: check.expectedStatus,
      descriptionVisible: Object.hasOwn(check, 'description'),
      description: Object.hasOwn(check, 'description') ? check.description : undefined,
      publicRoutes: [
        '/demo/',
        '/demo/docs',
        '/demo/openapi.json',
        '/demo/health/live',
        '/demo/health/ready',
        '/demo/api/v1/workspaces',
        '/demo/api/v1/services/:serviceId/uptime-checks',
      ],
      durableAuditEvent: true,
    },
    null,
    2,
  )}\n`,
);
