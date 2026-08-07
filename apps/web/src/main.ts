import { getCopy, localeOrder, type Copy, type Locale } from './i18n.js';

type EndpointKey = 'live' | 'ready' | 'openapi' | 'docs';
type ProbeState = 'checking' | 'online' | 'offline' | 'docs';

const endpointConfig: Record<EndpointKey, { path: string; labelKey: keyof Copy; note: string }> = {
  live: { path: '/demo/health/live', labelKey: 'liveEndpoint', note: 'process responds' },
  ready: { path: '/demo/health/ready', labelKey: 'readyEndpoint', note: 'dependencies ready' },
  openapi: { path: '/demo/openapi.json', labelKey: 'openapiEndpoint', note: 'contract exposed' },
  docs: { path: '/demo/docs', labelKey: 'docsEndpoint', note: 'Scalar docs' },
};

const evidenceItems = [
  { label: 'PostgreSQL', value: 'tenant state and incident records', state: 'running' },
  { label: 'Redis + BullMQ', value: 'rate limits and durable jobs', state: 'running' },
  { label: 'Hono API', value: 'auth boundaries and OpenAPI contract', state: 'live' },
  { label: 'Worker', value: 'background incident automation', state: 'active' },
  { label: 'Tencent staging', value: 'operator checklist before host changes', state: 'gated' },
];

const lifecycleItems = [
  { step: 'Ingest', detail: 'API-key protected routes receive workspace, service, and incident requests.' },
  { step: 'Queue', detail: 'Redis-backed jobs move delayed operational work outside the request path.' },
  { step: 'Resolve', detail: 'Worker automation records transitions and leaves API-visible evidence.' },
];

let currentLocale = readLocale();
let endpointStates: Record<EndpointKey, ProbeState> = {
  live: 'checking',
  ready: 'checking',
  openapi: 'checking',
  docs: 'docs',
};
let latencyMs = 0;
let openApiPathCount = 0;
let lastProbeAt = '--:--:--';

function readLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get('lang') as Locale | null;
  if (requested && localeOrder.includes(requested)) return requested;

  const stored = window.localStorage.getItem('pulseboard-locale') as Locale | null;
  if (stored && localeOrder.includes(stored)) return stored;

  return 'en';
}

function copy() {
  return getCopy(currentLocale);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stateLabel(state: ProbeState) {
  return copy()[state];
}

function stateClass(state: ProbeState) {
  if (state === 'online' || state === 'docs') return 'good';
  if (state === 'checking') return 'warn';
  return 'bad';
}

function renderLanguageOptions() {
  return localeOrder
    .map((locale) => `<option value="${locale}" ${locale === currentLocale ? 'selected' : ''}>${escapeHtml(getCopy(locale).languageName)}</option>`)
    .join('');
}

function endpointRow(key: EndpointKey) {
  const config = endpointConfig[key];
  const state = endpointStates[key];
  return `
    <a class="endpoint-row" href="${config.path}" target="_blank" rel="noreferrer">
      <span class="endpoint-name">
        <strong>${escapeHtml(copy()[config.labelKey])}</strong>
        <span>${escapeHtml(config.note)}</span>
      </span>
      <code>${config.path}</code>
      <span class="endpoint-status ${stateClass(state)}">${escapeHtml(stateLabel(state))}</span>
    </a>`;
}

function renderTerminal() {
  const rows = [
    { command: 'GET /demo/health/live', value: endpointStates.live, meta: latencyMs ? `${latencyMs}ms` : '--' },
    { command: 'GET /demo/health/ready', value: endpointStates.ready, meta: lastProbeAt },
    { command: 'GET /demo/openapi.json', value: endpointStates.openapi, meta: openApiPathCount ? `${openApiPathCount} paths` : '--' },
    { command: 'GET /demo/docs', value: 'docs' as ProbeState, meta: 'Scalar' },
  ];

  return rows
    .map(
      (row) => `
        <div class="terminal-line">
          <span class="prompt">pb</span>
          <span>${escapeHtml(row.command)}</span>
          <strong class="endpoint-status ${stateClass(row.value)}">${escapeHtml(stateLabel(row.value))}</strong>
          <span class="latency">${escapeHtml(row.meta)}</span>
        </div>`,
    )
    .join('');
}

function renderEvidenceRail() {
  return evidenceItems
    .map(
      (item) => `
        <li class="evidence-item">
          <span class="evidence-state">${escapeHtml(item.state)}</span>
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.value)}</span>
        </li>`,
    )
    .join('');
}

function renderLifecycle() {
  return lifecycleItems
    .map(
      (item, index) => `
        <li class="lifecycle-step">
          <time>0${index + 1}</time>
          <span><strong>${escapeHtml(item.step)}</strong><span>${escapeHtml(item.detail)}</span></span>
        </li>`,
    )
    .join('');
}

function renderArchitecture() {
  const nodes = [
    { name: copy().nodeFrontend, role: 'static cockpit', className: 'frontend' },
    { name: copy().nodeApi, role: 'Hono API', className: 'api' },
    { name: copy().nodeRedis, role: 'rate limit + jobs', className: 'redis' },
    { name: copy().nodeWorker, role: 'incident automation', className: 'worker' },
    { name: copy().nodeDb, role: 'tenant data', className: 'db' },
  ];

  return nodes
    .map(
      (node) => `
        <div class="architecture-node ${node.className}">
          <strong>${escapeHtml(node.name)}</strong>
          <span>${escapeHtml(node.role)}</span>
        </div>`,
    )
    .join('<span class="architecture-link" aria-hidden="true"></span>');
}

function render() {
  const c = copy();
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  document.documentElement.lang = currentLocale;
  document.documentElement.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';

  app.innerHTML = `
    <main class="app-shell">
      <header class="topbar">
        <a class="brand" href="/demo/" aria-label="PulseBoard">
          <span class="brand-mark">PB</span>
          <span class="brand-copy"><strong>PulseBoard</strong><small>Live Ops Console</small></span>
        </a>
        <nav class="nav-actions" aria-label="Primary">
          <a class="nav-link" href="#system">Runtime</a>
          <a class="nav-link" href="#architecture">Topology</a>
          <a class="nav-link" href="#deployment">Deploy gate</a>
          <a class="nav-link" href="/demo/frontend/">Customer view</a>
          <select class="lang-select" aria-label="Language selector">${renderLanguageOptions()}</select>
        </nav>
      </header>

      <section class="ops-hero" aria-labelledby="hero-title">
        <aside class="command-rail" aria-label="Operational snapshot">
          <div class="rail-label">production surface</div>
          <div class="rail-meter"><span>API</span><strong>${escapeHtml(stateLabel(endpointStates.ready))}</strong></div>
          <div class="rail-meter"><span>OpenAPI</span><strong>${openApiPathCount || '--'} paths</strong></div>
          <div class="rail-meter"><span>Locales</span><strong>${localeOrder.length}</strong></div>
          <div class="deploy-gate"><span>deploy gate</span><strong>backup -> nginx test -> reload</strong></div>
        </aside>

        <div class="hero-copy">
          <div class="kicker">${escapeHtml(c.eyebrow)}</div>
          <h1 id="hero-title">${escapeHtml(c.titleA)}<br />${escapeHtml(c.titleB)}</h1>
          <p class="lead">${escapeHtml(c.lead)}</p>
          <div class="hero-actions">
            <a class="primary-button" href="/demo/docs" target="_blank" rel="noreferrer">${escapeHtml(c.primaryCta)}</a>
            <a class="secondary-button" href="/demo/openapi.json" target="_blank" rel="noreferrer">${escapeHtml(c.navOpenApi)}</a>
            <button class="ghost-button" type="button" data-action="probe">${escapeHtml(c.secondaryCta)}</button>
          </div>
        </div>

        <aside class="probe-console" aria-label="Backend probe console">
          <div class="console-head">
            <span>probe terminal</span>
            <code>anlan.store</code>
          </div>
          <div class="terminal">${renderTerminal()}</div>
          <div class="console-foot">
            <span>${escapeHtml(c.metricLatency)}: <strong>${latencyMs || '--'}ms</strong></span>
            <span>${escapeHtml(c.metricPaths)}: <strong>${openApiPathCount || '--'}</strong></span>
            <span>${escapeHtml(c.metricLanguages)}: <strong>${localeOrder.length}</strong></span>
          </div>
        </aside>
      </section>

      <section class="evidence-rail" id="system" aria-label="Backend evidence rail">
        <div class="section-heading">
          <span class="section-label">Runtime Ledger</span>
          <h2>Backend plane, shown with receipts.</h2>
        </div>
        <ul>${renderEvidenceRail()}</ul>
      </section>

      <section class="surface-grid" aria-label="Frontend and backend surfaces">
        <article class="surface-panel">
          <div class="panel-header"><div><span class="panel-label">${escapeHtml(c.frontendLabel)}</span><h2>${escapeHtml(c.frontendTitle)}</h2></div><span class="status-badge">${escapeHtml(c.frontendStatus)}</span></div>
          <p>${escapeHtml(c.frontendCopy)}</p>
          <div class="release-ledger" aria-label="Frontend release ledger">
            <div><span>route</span><strong>/demo/frontend/</strong></div>
            <div><span>languages</span><strong>${localeOrder.length}</strong></div>
            <div><span>proof link</span><strong>Backend proof</strong></div>
          </div>
          <a class="text-link" href="/demo/frontend/">${escapeHtml(c.frontendHomeCta)}</a>
        </article>

        <article class="surface-panel">
          <div class="panel-header"><div><span class="panel-label">${escapeHtml(c.backendLabel)}</span><h2>${escapeHtml(c.backendTitle)}</h2></div><span class="status-badge">${escapeHtml(c.backendStatus)}</span></div>
          <p>${escapeHtml(c.backendCopy)}</p>
          <div class="backend-stack">${endpointRow('live')}${endpointRow('ready')}${endpointRow('openapi')}${endpointRow('docs')}</div>
        </article>
      </section>

      <section class="architecture-band" id="architecture" aria-label="Deployment architecture">
        <div class="section-heading">
          <span class="section-label">${escapeHtml(c.mapTitle)}</span>
          <h2>${escapeHtml(c.mapCopy)}</h2>
        </div>
        <div class="architecture-map">${renderArchitecture()}</div>
      </section>

      <section class="operations-band" aria-label="Incident lifecycle and deployment boundary">
        <article class="lifecycle-card">
          <span class="section-label">Incident Runway</span>
          <h2>${escapeHtml(c.timelineTitle)}</h2>
          <p>${escapeHtml(c.timelineCopy)}</p>
          <ol>${renderLifecycle()}</ol>
        </article>
        <article class="deployment-card" id="deployment">
          <span class="section-label">Deployment Boundary</span>
          <h2>Staging-ready, deliberately gated.</h2>
          <p>No secrets, IPs, cloud credentials, DNS tokens, or Terraform actions are embedded in the public site. The Tencent rehearsal checklist remains the handoff point before host changes.</p>
          <div class="boundary-list">
            <span>local build: verified artifact</span>
            <span>server deploy: backup before install</span>
            <span>rollback: static files and nginx config</span>
          </div>
        </article>
      </section>

      <footer class="footer">
        <span>${escapeHtml(c.footer)}</span>
        <span><a href="/demo/openapi.json" target="_blank" rel="noreferrer">OpenAPI</a> / <a href="/demo/docs" target="_blank" rel="noreferrer">Scalar</a> / <a href="/demo/health/ready" target="_blank" rel="noreferrer">Ready</a></span>
      </footer>
    </main>`;

  app.querySelector<HTMLSelectElement>('.lang-select')?.addEventListener('change', (event) => {
    const next = (event.currentTarget as HTMLSelectElement).value as Locale;
    if (!localeOrder.includes(next)) return;
    currentLocale = next;
    window.localStorage.setItem('pulseboard-locale', next);
    render();
  });

  app.querySelector<HTMLButtonElement>('[data-action="probe"]')?.addEventListener('click', () => {
    void probeBackend();
  });
}

async function fetchWithTimeout(path: string, timeoutMs = 3500) {
  const started = performance.now();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(path, { cache: 'no-store', signal: controller.signal });
    return { response, latency: Math.round(performance.now() - started) };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function probeBackend() {
  endpointStates = { ...endpointStates, live: 'checking', ready: 'checking', openapi: 'checking' };
  render();

  try {
    const live = await fetchWithTimeout('/demo/health/live');
    endpointStates.live = live.response.ok ? 'online' : 'offline';
    latencyMs = live.latency;
  } catch {
    endpointStates.live = 'offline';
    latencyMs = 0;
  }

  try {
    const ready = await fetchWithTimeout('/demo/health/ready');
    endpointStates.ready = ready.response.ok ? 'online' : 'offline';
  } catch {
    endpointStates.ready = 'offline';
  }

  try {
    const openapi = await fetchWithTimeout('/demo/openapi.json');
    endpointStates.openapi = openapi.response.ok ? 'online' : 'offline';
    if (openapi.response.ok) {
      const document = (await openapi.response.json()) as { paths?: Record<string, unknown> };
      openApiPathCount = Object.keys(document.paths ?? {}).length;
    } else {
      openApiPathCount = 0;
    }
  } catch {
    endpointStates.openapi = 'offline';
    openApiPathCount = 0;
  }

  lastProbeAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  render();
}

render();
void probeBackend();
