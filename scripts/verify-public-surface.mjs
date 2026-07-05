const baseUrl = normalizeBaseUrl(process.env.PUBLIC_BASE_URL ?? 'https://anlan.store');
const failures = [];
const observations = [];
const text = (...codePoints) => String.fromCodePoint(...codePoints);

const traditionalChineseLabel = text(0x7e41, 0x9ad4, 0x4e2d, 0x6587);
const simplifiedChineseLabel = text(0x7b80, 0x4f53, 0x4e2d, 0x6587);
const arabicLabel = text(0x0627, 0x0644, 0x0639, 0x0631, 0x0628, 0x064a, 0x0629);
const localeOrderNeedle = "const localeOrder = ['en', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'ar', 'zh-CN'];";

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/+$/, '');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function endpoint(path) {
  return `${baseUrl}${path}`;
}

function expect(name, condition, detail = '') {
  if (!condition) failures.push(detail ? `${name}: ${detail}` : name);
}

function observe(name, value) {
  observations.push(`${name}: ${value}`);
}

async function fetchText(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.PUBLIC_VERIFY_TIMEOUT_MS ?? 12000));
  try {
    const response = await fetch(endpoint(path), {
      redirect: options.redirect ?? 'follow',
      headers: { accept: options.accept ?? '*/*' },
      signal: controller.signal,
    });
    const body = await response.text();
    observe(`${path} status`, `${response.status} ${response.statusText}`);
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
    failures.push(`${path} JSON parse failed: ${error.message}`);
    return { ...result, json: null };
  }
}

async function verifyHomepage() {
  const { response, body } = await fetchText('/');
  expect('homepage returns 200', response.status === 200, `${response.status} ${response.statusText}`);
  expect('homepage is HTML', (response.headers.get('content-type') ?? '').includes('text/html'), response.headers.get('content-type') ?? '<missing>');
  expect('homepage title is frontend + backend demo', body.includes('<title>PulseBoard - Frontend + Backend Demo</title>'));
  expect('homepage includes app root', body.includes('id="app"'));
  expect('homepage includes frontend plane', body.includes('Frontend plane'));
  expect('homepage includes backend plane', body.includes('Backend plane'));
  expect('homepage includes English-first locale order', body.includes(localeOrderNeedle));
  expect('homepage includes Traditional Chinese locale', body.includes(traditionalChineseLabel));
  expect('homepage includes Simplified Chinese locale', body.includes(simplifiedChineseLabel));
  expect('homepage includes Arabic locale', body.includes(arabicLabel));
  expect('homepage includes liveness probe path', body.includes('/health/live'));
  expect('homepage includes readiness probe path', body.includes('/health/ready'));
  expect('homepage includes OpenAPI probe path', body.includes('/openapi.json'));
  expect('homepage includes API docs path', body.includes('/docs'));
  expect('homepage supports deterministic locale URL param', body.includes("get('lang')"));
  expect('homepage supports Arabic RTL direction', body.includes("currentLocale === 'ar' ? 'rtl' : 'ltr'"));
}

async function verifyBackendSurface() {
  const live = await fetchJson('/health/live');
  expect('liveness returns 200', live.response.status === 200, `${live.response.status} ${live.response.statusText}`);
  expect('liveness body status is ok', live.json?.status === 'ok', live.body.slice(0, 160));

  const ready = await fetchJson('/health/ready');
  expect('readiness returns 200', ready.response.status === 200, `${ready.response.status} ${ready.response.statusText}`);
  expect('readiness body status is ready', ready.json?.status === 'ready', ready.body.slice(0, 160));

  const openapi = await fetchJson('/openapi.json');
  expect('OpenAPI returns 200', openapi.response.status === 200, `${openapi.response.status} ${openapi.response.statusText}`);
  const paths = openapi.json?.paths && typeof openapi.json.paths === 'object' ? Object.keys(openapi.json.paths) : [];
  observe('OpenAPI path count', paths.length);
  expect('OpenAPI includes liveness path', paths.includes('/health/live'));
  expect('OpenAPI includes readiness path', paths.includes('/health/ready'));
  expect('OpenAPI includes API key lifecycle path', paths.includes('/v1/api-keys'));
  expect('OpenAPI includes workspace path', paths.includes('/v1/workspaces'));

  const docs = await fetchText('/docs', { accept: 'text/html' });
  expect('API docs returns 200', docs.response.status === 200, `${docs.response.status} ${docs.response.statusText}`);
  expect('API docs page references PulseBoard API', docs.body.includes('PulseBoard API') || docs.body.includes('api-reference'));

  const unauthorized = await fetchJson('/v1/workspaces');
  expect('protected workspace route returns 401 without API key', unauthorized.response.status === 401, `${unauthorized.response.status} ${unauthorized.response.statusText}`);
  expect('protected workspace route does not leak data', !Array.isArray(unauthorized.json), unauthorized.body.slice(0, 160));
}

async function verifyWwwRedirect() {
  const url = new URL(baseUrl);
  if (url.hostname !== 'anlan.store') return;

  const wwwUrl = new URL(baseUrl);
  wwwUrl.hostname = 'www.anlan.store';
  const response = await fetch(wwwUrl.toString(), { redirect: 'manual' });
  observe('www redirect status', `${response.status} ${response.statusText}`);
  expect('www redirects to bare domain', response.status >= 300 && response.status < 400, `${response.status} ${response.statusText}`);
  expect('www redirect location is bare domain', (response.headers.get('location') ?? '').startsWith('https://anlan.store/'), response.headers.get('location') ?? '<missing>');
}

try {
  await verifyHomepage();
  await verifyBackendSurface();
  await verifyWwwRedirect();
} catch (error) {
  failures.push(`verification crashed: ${error instanceof Error ? error.message : String(error)}`);
}

console.log(`PulseBoard public surface verification target: ${baseUrl}`);
for (const observation of observations) console.log(`- ${observation}`);

if (failures.length > 0) {
  console.error('PulseBoard public surface verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PulseBoard public surface verified.');
