import { getCopy, localeOrder, type Copy, type Locale } from './i18n.js';

type EndpointKey = 'live' | 'ready' | 'openapi' | 'docs';
type ProbeState = 'checking' | 'online' | 'offline' | 'docs';

const endpointConfig: Record<EndpointKey, { path: string; labelKey: keyof Copy }> = {
  live: { path: '/health/live', labelKey: 'liveEndpoint' },
  ready: { path: '/health/ready', labelKey: 'readyEndpoint' },
  openapi: { path: '/openapi.json', labelKey: 'openapiEndpoint' },
  docs: { path: '/docs', labelKey: 'docsEndpoint' },
};

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
    .map((locale) => `<option value="${locale}" ${locale === currentLocale ? 'selected' : ''}>${getCopy(locale).languageName}</option>`)
    .join('');
}

function endpointRow(key: EndpointKey) {
  const config = endpointConfig[key];
  const state = endpointStates[key];
  return `
    <a class="endpoint-row" href="${config.path}" target="_blank" rel="noreferrer">
      <span>
        <strong>${escapeHtml(copy()[config.labelKey])}</strong>
        <span class="endpoint-path">${config.path}</span>
      </span>
      <span class="endpoint-status ${stateClass(state)}">${escapeHtml(stateLabel(state))}</span>
    </a>`;
}

function renderTerminal() {
  const rows = [
    { command: 'GET /health/live', value: endpointStates.live, latency: latencyMs ? `${latencyMs}ms` : '--' },
    { command: 'GET /health/ready', value: endpointStates.ready, latency: lastProbeAt },
    { command: 'GET /openapi.json', value: endpointStates.openapi, latency: openApiPathCount ? `${openApiPathCount} paths` : '--' },
    { command: 'GET /docs', value: 'docs' as ProbeState, latency: 'Scalar' },
    { command: 'UI locale order', value: 'online' as ProbeState, latency: `${localeOrder[0]} → ${localeOrder.at(-1)}` },
  ];

  return rows
    .map(
      (row) => `
        <div class="terminal-line">
          <span class="prompt">›</span>
          <span>${escapeHtml(row.command)} <strong class="endpoint-status ${stateClass(row.value)}">${escapeHtml(stateLabel(row.value))}</strong></span>
          <span class="latency">${escapeHtml(row.latency)}</span>
        </div>`,
    )
    .join('');
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
        <a class="brand" href="/" aria-label="PulseBoard">
          <span class="brand-mark"><span>PB</span></span>
          <span class="brand-copy"><strong>PulseBoard</strong><small>Frontend + Backend Demo</small></span>
        </a>
        <nav class="nav-actions" aria-label="Primary">
          <select class="lang-select" aria-label="Language selector">${renderLanguageOptions()}</select>
          <a class="nav-link" href="/docs" target="_blank" rel="noreferrer">${escapeHtml(c.navDocs)}</a>
          <a class="nav-link" href="/openapi.json" target="_blank" rel="noreferrer">${escapeHtml(c.navOpenApi)}</a>
          <a class="nav-link" href="/health/ready" target="_blank" rel="noreferrer">${escapeHtml(c.navHealth)}</a>
        </nav>
      </header>

      <section class="hero" aria-labelledby="hero-title">
        <div>
          <div class="kicker">${escapeHtml(c.eyebrow)}</div>
          <h1 id="hero-title"><span class="gradient-text">${escapeHtml(c.titleA)}</span><br />${escapeHtml(c.titleB)}</h1>
          <p class="lead">${escapeHtml(c.lead)}</p>
          <div class="hero-actions">
            <a class="frontend-home-button" href="#frontend-home" aria-label="${escapeHtml(c.frontendHomeCta)}">${escapeHtml(c.frontendHomeCta)} <span aria-hidden="true">↓</span></a>
            <a class="primary-button" href="/docs" target="_blank" rel="noreferrer">${escapeHtml(c.primaryCta)} ↗</a>
            <button class="ghost-button" type="button" data-action="probe">${escapeHtml(c.secondaryCta)}</button>
          </div>
          <div class="metrics-strip" aria-label="Live metrics">
            <div class="metric-pill"><strong>${latencyMs || '--'}ms</strong><span>${escapeHtml(c.metricLatency)}</span></div>
            <div class="metric-pill"><strong>${openApiPathCount || '--'}</strong><span>${escapeHtml(c.metricPaths)}</span></div>
            <div class="metric-pill"><strong>${localeOrder.length}</strong><span>${escapeHtml(c.metricLanguages)}</span></div>
          </div>
        </div>
        <aside class="command-card" aria-label="Backend probe console">
          <div class="card-head"><span class="window-dots"><i></i><i></i><i></i></span><code>edge / pulseboard</code></div>
          <div class="terminal">${renderTerminal()}</div>
        </aside>
      </section>

      <section class="dual-grid" aria-label="Frontend and backend surfaces">
        <article class="panel frontend-home-panel" id="frontend-home" tabindex="-1">
          <div class="panel-header"><div><div class="panel-label">${escapeHtml(c.frontendLabel)}</div><h2>${escapeHtml(c.frontendTitle)}</h2></div><span class="status-badge">${escapeHtml(c.frontendStatus)}</span></div>
          <p class="panel-copy">${escapeHtml(c.frontendCopy)}</p>
          <div class="feature-stack" style="margin-top: 22px">
            <div class="feature-card"><span class="feature-icon">◌</span><span><strong>${escapeHtml(c.featureRealtime)}</strong><span>${escapeHtml(c.featureRealtimeCopy)}</span></span></div>
            <div class="feature-card"><span class="feature-icon">文</span><span><strong>${escapeHtml(c.featureI18n)}</strong><span>${escapeHtml(c.featureI18nCopy)}</span></span></div>
            <div class="feature-card"><span class="feature-icon">↗</span><span><strong>${escapeHtml(c.featureOperator)}</strong><span>${escapeHtml(c.featureOperatorCopy)}</span></span></div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header"><div><div class="panel-label">${escapeHtml(c.backendLabel)}</div><h2>${escapeHtml(c.backendTitle)}</h2></div><span class="status-badge">${escapeHtml(c.backendStatus)}</span></div>
          <p class="panel-copy">${escapeHtml(c.backendCopy)}</p>
          <div class="backend-stack" style="margin-top: 22px">
            ${endpointRow('live')}
            ${endpointRow('ready')}
            ${endpointRow('openapi')}
            ${endpointRow('docs')}
          </div>
        </article>
      </section>

      <section class="integration-band" aria-label="Deployment architecture and evidence timeline">
        <article class="signal-map">
          <div class="panel-label">${escapeHtml(c.mapTitle)}</div>
          <p class="panel-copy">${escapeHtml(c.mapCopy)}</p>
          <div class="signal-orbit" aria-hidden="true">
            <span class="signal-line one"></span><span class="signal-line two"></span><span class="signal-line three"></span>
            <span class="node frontend">${escapeHtml(c.nodeFrontend)}</span><span class="node api">${escapeHtml(c.nodeApi)}</span><span class="node worker">${escapeHtml(c.nodeWorker)}</span><span class="node db">${escapeHtml(c.nodeDb)}</span><span class="node redis">${escapeHtml(c.nodeRedis)}</span>
          </div>
        </article>
        <article class="timeline">
          <div class="panel-label">${escapeHtml(c.timelineTitle)}</div>
          <p class="panel-copy">${escapeHtml(c.timelineCopy)}</p>
          <div class="timeline-list">
            <div class="timeline-item"><time>00:00</time><span><strong>${escapeHtml(c.timelineOne)}</strong><span>${escapeHtml(c.timelineOneCopy)}</span></span></div>
            <div class="timeline-item"><time>00:01</time><span><strong>${escapeHtml(c.timelineTwo)}</strong><span>${escapeHtml(c.timelineTwoCopy)}</span></span></div>
            <div class="timeline-item"><time>00:02</time><span><strong>${escapeHtml(c.timelineThree)}</strong><span>${escapeHtml(c.timelineThreeCopy)}</span></span></div>
          </div>
        </article>
      </section>

      <footer class="footer">
        <span>${escapeHtml(c.footer)}</span>
        <span><a href="/openapi.json" target="_blank" rel="noreferrer">OpenAPI</a> · <a href="/docs" target="_blank" rel="noreferrer">Scalar</a> · <a href="/health/ready" target="_blank" rel="noreferrer">Ready</a></span>
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
    const live = await fetchWithTimeout('/health/live');
    endpointStates.live = live.response.ok ? 'online' : 'offline';
    latencyMs = live.latency;
  } catch {
    endpointStates.live = 'offline';
    latencyMs = 0;
  }

  try {
    const ready = await fetchWithTimeout('/health/ready');
    endpointStates.ready = ready.response.ok ? 'online' : 'offline';
  } catch {
    endpointStates.ready = 'offline';
  }

  try {
    const openapi = await fetchWithTimeout('/openapi.json');
    endpointStates.openapi = openapi.response.ok ? 'online' : 'offline';
    if (openapi.response.ok) {
      const document = (await openapi.response.json()) as { paths?: Record<string, unknown> };
      openApiPathCount = Object.keys(document.paths ?? {}).length;
    }
  } catch {
    endpointStates.openapi = 'offline';
  }

  endpointStates.docs = 'docs';
  lastProbeAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  render();
}

render();
void probeBackend();
window.setInterval(() => {
  void probeBackend();
}, 30000);
