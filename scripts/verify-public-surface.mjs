const baseUrl = normalizeBaseUrl(process.env.PUBLIC_BASE_URL ?? 'https://anlan.store');
const failures = [];
const observations = [];
const text = (...codePoints) => String.fromCodePoint(...codePoints);

const traditionalChineseLabel = text(0x7e41, 0x9ad4, 0x4e2d, 0x6587);
const simplifiedChineseLabel = text(0x7b80, 0x4f53, 0x4e2d, 0x6587);
const arabicLabel = text(0x0627, 0x0644, 0x0639, 0x0631, 0x0628, 0x064a, 0x0629);
const localeOrderNeedle = "const localeOrder = ['en', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'ar', 'zh-CN'];";
const retiredStyleNeedles = [
  'gradient-text',
  'towerCore',
  'camera-x',
  'Opening orbit: software factory floor',
  'Scroll-driven 3D storytelling',
  'vertical-tower-preview',
  'Reliability Desk',
  'Evidence Rail'
];
const portalKeywordNeedles = [
  "railKeywords: ['Astro', 'AI Skills', 'Windows CLI']",
  "railKeywords: ['Hono', 'PostgreSQL', 'Redis']",
  "railKeywords: ['invite-only', 'inbox', 'digests']",
  "railKeywords: ['AWS', 'questions', 'progress']",
  "railKeywords: ['AWS', 'architecture', 'advanced']",
  "railKeywords: ['ITSM', 'study', 'unlinked']",
  "railKeywords: ['C++', 'Eigen', 'VMD']",
  "railKeywords: ['Python', 'localization', 'MIT']",
  "railKeywords: ['GPT', 'writing', 'Python']",
  "railKeywords: ['Python', 'robotics', 'RRT']"
];
const portalLocaleMarkers = [
  text(0x4e2d, 0x56fd, 0x8a9e, 0x540d, 0x306f, 0x9053, 0x5b89, 0x703e),
  text(0x50c5, 0x9650, 0x53d7, 0x9080),
  text(0x4ec5, 0x9650, 0x53d7, 0x9080),
  text(0x62db, 0x5f85, 0x5236)
];

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/+$/, '');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function endpoint(path) {
  return baseUrl + path;
}

function expect(name, condition, detail = '') {
  if (!condition) failures.push(detail ? name + ': ' + detail : name);
}

function observe(name, value) {
  observations.push(name + ': ' + value);
}

async function fetchText(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.PUBLIC_VERIFY_TIMEOUT_MS ?? 12000));
  try {
    const response = await fetch(endpoint(path), {
      redirect: options.redirect ?? 'follow',
      headers: { accept: options.accept ?? '*/*' },
      signal: controller.signal
    });
    const body = await response.text();
    observe(path + ' status', response.status + ' ' + response.statusText);
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(path) {
  const result = await fetchText(path, { accept: 'application/json' });
  try {
    return { ...result, json: JSON.parse(result.body) };
  } catch (error) {
    failures.push(path + ' JSON parse failed: ' + error.message);
    return { ...result, json: null };
  }
}

function verifyLocaleSurface(body, scope) {
  expect(scope + ' includes English-first locale order', body.includes(localeOrderNeedle));
  expect(scope + ' includes Traditional Chinese locale', body.includes(traditionalChineseLabel));
  expect(scope + ' includes Simplified Chinese locale', body.includes(simplifiedChineseLabel));
  expect(scope + ' includes Arabic locale', body.includes(arabicLabel));
  expect(scope + ' has no replacement characters', !body.includes(text(0xfffd)));
  for (const needle of retiredStyleNeedles) {
    expect(scope + ' retired old marker: ' + needle, !body.includes(needle));
  }
}

async function verifyPortal() {
  const { response, body } = await fetchText('/');
  expect('portal returns 200', response.status === 200, response.status + ' ' + response.statusText);
  expect('portal is HTML', (response.headers.get('content-type') ?? '').includes('text/html'), response.headers.get('content-type') ?? '<missing>');
  expect('portal title identifies ANLAN.STORE', body.includes('<title>ANLAN.STORE — Project Frequencies</title>'));
  expect('portal introduces Dodge in the approved colorful Signal Lattice identity', body.includes('ANLAN.STORE') && body.includes('DODGE HO.<br>BUILDS IN PUBLIC.') && body.includes('道安澜') && body.includes('道安瀾') && body.includes('id="signal-lattice"'));
  expect('portal links the supplied personal LinkedIn profile clearly', body.includes('https://www.linkedin.com/in/lang-he-a94655120/') && body.includes('My LinkedIn profile') && body.includes('LinkedIn profile'));
  expect('portal includes complete four-language locale controls', body.includes('data-locale="en"') && body.includes('data-locale="zh-Hant"') && body.includes('data-locale="zh-Hans"') && body.includes('data-locale="ja"'));
  expect('portal defaults to English and only persists an explicit locale choice', body.includes("let currentLocale = 'en'") && body.includes("const localeStorageKey = 'anlan.portal.locale'") && body.includes('safeStoredLocale') && body.includes('document.documentElement.lang = currentLocale'));
  expect('portal supports shareable language hash routes without replacing project anchors', body.includes("'#en': 'en'") && body.includes("'#zh': 'zh-Hans'") && body.includes("'#zh-hant': 'zh-Hant'") && body.includes("'#zh-hans': 'zh-Hans'") && body.includes("'#ja': 'ja'") && body.includes("window.addEventListener('hashchange'") && body.includes('localeFromHash() || safeStoredLocale()'));
  expect('portal retains HeatStack, PulseBoard, and Career Radar routes', body.includes("route: '/heatstack/'") && body.includes('HeatStack') && body.includes('AI 热栈') && body.includes("route: '/demo/'") && body.includes("route: '/jobs/'") && body.includes('PulseBoard') && body.includes('Career Radar'));
  expect('portal retains promoted study routes but deliberately has no ISPM route action', body.includes("route: '/saa/'") && body.includes("route: '/sap/'") && !body.includes("route: '/ispm/'") && !body.includes('href="/ispm/"') && !body.includes('href="#project-ispm"'));
  expect('portal includes verified GitHub source projects', body.includes('VMD_cpp') && body.includes('PAL4_EnglishMod') && body.includes('https://github.com/DodgeHo/VMD_cpp') && body.includes('https://github.com/DodgeHo/PAL4_EnglishMod') && body.includes('IELTS_writing_GPT') && body.includes('dynamic_rrt_connect'));
  expect('portal exposes all ten technical keyword sets and non-uniform project hierarchy', portalKeywordNeedles.every((needle) => body.includes(needle)) && portalLocaleMarkers.every((marker) => body.includes(marker)) && body.includes("layout: 'feature'") && body.includes("layout: 'major'") && body.includes("layout: 'study-small'") && body.includes("layout: 'quiet'") && body.includes("layout: 'research'") && body.includes("layout: 'source-compact'") && body.includes("layout: 'source-wide'"));
  expect('portal includes working filter controls', body.includes('data-filter="source"') && body.includes('applyFilter'));
  expect('portal includes both PulseBoard captures', (body.match(/data:image\/png;base64,/g) ?? []).length === 2);
  expect('portal has no unresolved build placeholders', !/__PORTAL_[A-Z_]+__/.test(body) && !/__PULSEBOARD_[A-Z_]+__/.test(body));
}

async function verifyHeatStack() {
  const canonical = await fetchText('/heatstack', { redirect: 'manual' });
  expect('/heatstack redirects', canonical.response.status >= 300 && canonical.response.status < 400, canonical.response.status + ' ' + canonical.response.statusText);
  expect('/heatstack redirects to /heatstack/', (canonical.response.headers.get('location') ?? '').endsWith('/heatstack/'), canonical.response.headers.get('location') ?? '<missing>');

  const { response, body } = await fetchText('/heatstack/', { accept: 'text/html' });
  expect('HeatStack route returns 200', response.status === 200, response.status + ' ' + response.statusText);
  expect('HeatStack route is HTML', (response.headers.get('content-type') ?? '').includes('text/html'), response.headers.get('content-type') ?? '<missing>');
  expect(
    'HeatStack route serves the standalone Astro app rather than the portal fallback',
    body.includes('<title>AI ') &&
      body.includes('HeatStack —') &&
      body.includes('href="/heatstack/favicon.svg"') &&
      !body.includes('id="signal-lattice"')
  );

  const health = await fetchJson('/heatstack/api/v1/health');
  expect('HeatStack API health returns 200', health.response.status === 200, health.response.status + ' ' + health.response.statusText);
  expect('HeatStack API identifies the running service', health.json?.ok === true && health.json?.service === 'heatstack-api', health.body.slice(0, 200));
}

async function verifyCareerRadar() {
  const canonical = await fetchText('/jobs', { redirect: 'manual' });
  expect('/jobs redirects', canonical.response.status === 308, canonical.response.status + ' ' + canonical.response.statusText);
  expect('/jobs redirects to /jobs/', (canonical.response.headers.get('location') ?? '').endsWith('/jobs/'), canonical.response.headers.get('location') ?? '<missing>');

  const { response, body } = await fetchText('/jobs/', { accept: 'text/html' });
  expect('Career Radar route returns 200 after login redirect', response.status === 200, response.status + ' ' + response.statusText);
  expect('Career Radar route is HTML', (response.headers.get('content-type') ?? '').includes('text/html'), response.headers.get('content-type') ?? '<missing>');
  expect('Career Radar retains subpath-aware login shell', body.includes('<title>Career Radar</title>') && body.includes('data-base-path="/jobs"'));
}

async function verifyPulseBoard() {
  const { response, body } = await fetchText('/demo/');
  expect('PulseBoard demo returns 200', response.status === 200, response.status + ' ' + response.statusText);
  expect('PulseBoard demo is HTML', (response.headers.get('content-type') ?? '').includes('text/html'), response.headers.get('content-type') ?? '<missing>');
  expect('PulseBoard demo title is Live Ops Console', body.includes('<title>PulseBoard - Live Ops Console</title>'));
  expect('PulseBoard demo has operational hero', body.includes('PulseBoard Live Ops Console.') && body.includes('A backend portfolio you can interrogate.'));
  expect('PulseBoard demo surfaces runtime evidence', body.includes('probe terminal') && body.includes('Runtime Ledger') && body.includes('Incident Runway'));
  expect('PulseBoard demo links customer route', body.includes('href="/demo/frontend/"'));
  expect('PulseBoard demo uses namespaced probes', body.includes('/demo/health/live') && body.includes('/demo/health/ready'));
  expect('PulseBoard demo uses namespaced docs', body.includes('/demo/openapi.json') && body.includes('/demo/docs'));
  expect('PulseBoard demo supports RTL Arabic', body.includes("currentLocale === 'ar' ? 'rtl' : 'ltr'"));
  verifyLocaleSurface(body, 'PulseBoard demo');
}

async function verifyCustomerSurface() {
  const { response, body } = await fetchText('/demo/frontend/');
  expect('customer surface returns 200', response.status === 200, response.status + ' ' + response.statusText);
  expect('customer surface is HTML', (response.headers.get('content-type') ?? '').includes('text/html'), response.headers.get('content-type') ?? '<missing>');
  expect('customer surface title is Reliability Works', body.includes('<title>PulseBoard Reliability Works</title>'));
  expect('customer surface has product workflow', body.includes('Workflow') && body.includes('Automation queue') && body.includes('Evidence links'));
  expect('customer surface has release and lifecycle sections', body.includes('Release posture') && body.includes('Lifecycle'));
  expect('customer surface uses namespaced backend links', body.includes('/demo/health/ready') && body.includes('/demo/openapi.json') && body.includes('/demo/docs'));
  expect('customer surface links back to PulseBoard', body.includes('href="/demo/"'));
  expect('customer surface supports RTL Arabic', body.includes("active === 'ar' ? 'rtl' : 'ltr'"));
  verifyLocaleSurface(body, 'customer surface');
}

async function verifyBackendSurface() {
  const live = await fetchJson('/demo/health/live');
  expect('liveness returns 200', live.response.status === 200, live.response.status + ' ' + live.response.statusText);
  expect('liveness body status is ok', live.json?.status === 'ok', live.body.slice(0, 160));

  const ready = await fetchJson('/demo/health/ready');
  expect('readiness returns 200', ready.response.status === 200, ready.response.status + ' ' + ready.response.statusText);
  expect('readiness body status is ready', ready.json?.status === 'ready', ready.body.slice(0, 160));

  const openapi = await fetchJson('/demo/openapi.json');
  expect('OpenAPI returns 200', openapi.response.status === 200, openapi.response.status + ' ' + openapi.response.statusText);
  const paths = openapi.json?.paths && typeof openapi.json.paths === 'object' ? Object.keys(openapi.json.paths) : [];
  observe('OpenAPI path count', paths.length);
  expect('OpenAPI includes public liveness path', paths.includes('/demo/health/live'));
  expect('OpenAPI includes public readiness path', paths.includes('/demo/health/ready'));
  expect('OpenAPI includes public API key path', paths.includes('/demo/api/v1/api-keys'));
  expect('OpenAPI includes public workspace path', paths.includes('/demo/api/v1/workspaces'));

  const docs = await fetchText('/demo/docs', { accept: 'text/html' });
  expect('API docs returns 200', docs.response.status === 200, docs.response.status + ' ' + docs.response.statusText);
  expect('API docs references PulseBoard API', docs.body.includes('PulseBoard API') || docs.body.includes('api-reference'));
  expect('API docs loads namespaced OpenAPI', docs.body.includes('/demo/openapi.json'));

  const unauthorized = await fetchJson('/demo/api/v1/workspaces');
  expect('protected workspace route returns 401 without API key', unauthorized.response.status === 401, unauthorized.response.status + ' ' + unauthorized.response.statusText);
  expect('protected workspace route does not leak data', !Array.isArray(unauthorized.json), unauthorized.body.slice(0, 160));
}

async function verifyStudyRoutes() {
  for (const path of ['/saa/', '/sap/', '/ispm/']) {
    const { response, body } = await fetchText(path, { accept: 'text/html' });
    expect(path + ' returns 200', response.status === 200, response.status + ' ' + response.statusText);
    expect(path + ' is HTML', (response.headers.get('content-type') ?? '').includes('text/html'), response.headers.get('content-type') ?? '<missing>');
    expect(path + ' retains Flutter app shell', body.includes('flutter') || body.includes('flt-glass-pane'));
  }
}

async function verifyLegacyRedirects() {
  for (const [oldPath, newPath] of [
    ['/frontend/', '/demo/frontend/'],
    ['/docs', '/demo/docs'],
    ['/openapi.json', '/demo/openapi.json'],
    ['/health/live', '/demo/health/live'],
    ['/v1/workspaces', '/demo/api/v1/workspaces']
  ]) {
    const { response } = await fetchText(oldPath, { redirect: 'manual' });
    const location = response.headers.get('location') ?? '';
    const redirectedPath = location ? new URL(location, endpoint(oldPath)).pathname : '';
    expect(oldPath + ' redirects', response.status >= 300 && response.status < 400, response.status + ' ' + response.statusText);
    expect(oldPath + ' redirects to ' + newPath, redirectedPath === newPath, location || '<missing>');
  }
}

async function verifyWwwRedirect() {
  const url = new URL(baseUrl);
  if (url.hostname !== 'anlan.store') return;
  const wwwUrl = new URL(baseUrl);
  wwwUrl.hostname = 'www.anlan.store';
  const response = await fetch(wwwUrl.toString(), { redirect: 'manual' });
  observe('www redirect status', response.status + ' ' + response.statusText);
  expect('www redirects to bare domain', response.status >= 300 && response.status < 400, response.status + ' ' + response.statusText);
  expect('www redirect location is bare domain', (response.headers.get('location') ?? '').startsWith('https://anlan.store/'), response.headers.get('location') ?? '<missing>');
}

try {
  await verifyPortal();
  await verifyPulseBoard();
  await verifyCustomerSurface();
  await verifyBackendSurface();
  await verifyHeatStack();
  await verifyCareerRadar();
  await verifyStudyRoutes();
  await verifyLegacyRedirects();
  await verifyWwwRedirect();
} catch (error) {
  failures.push('verification crashed: ' + (error instanceof Error ? error.message : String(error)));
}

console.log('Anlan public surface verification target: ' + baseUrl);
for (const observation of observations) console.log('- ' + observation);

if (failures.length > 0) {
  console.error('Anlan public surface verification failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('Anlan project portal, HeatStack, Career Radar, and PulseBoard demo verified.');
