const baseUrl = normalizeBaseUrl(process.env.PUBLIC_BASE_URL ?? 'https://anlan.store');
const failures = [];
const observations = [];
const privateNames = [
  'careerforge-autoapply', 'DSP_EPFL', 'interval_map', 'leaverequests', 'littlelemon',
  'motion_example', 'myLittleLemon', 'P1117', 'PAL3_debug', 'PAL3_translation',
  'PAL4_translation', 'RogerPhysics', 'ros'
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

function rowFor(body, name) {
  return [...body.matchAll(/<article class="archive-row"[\s\S]*?<\/article>/g)]
    .map((match) => match[0])
    .find((row) => row.includes(`data-name="${name}"`));
}

function verifyMetadata(body, scope) {
  expect(scope + ' has canonical URL', body.includes('<link rel="canonical"'));
  expect(scope + ' has Open Graph metadata', body.includes('<meta property="og:title"'));
  expect(scope + ' has JSON-LD', body.includes('type="application/ld+json"'));
  for (const locale of ['en', 'zh-Hant', 'zh-Hans', 'ja', 'x-default']) {
    expect(scope + ' has hreflang ' + locale, body.includes(`hreflang="${locale}"`));
  }
  expect(scope + ' has no unresolved placeholders', !/__[A-Z0-9_]+__/.test(body));
  expect(scope + ' has no replacement characters', !body.includes('\uFFFD'));
}

async function verifyPortal() {
  const { response, body } = await fetchText('/');
  expect('portal returns 200', response.status === 200, response.status + ' ' + response.statusText);
  expect('portal is HTML', (response.headers.get('content-type') ?? '').includes('text/html'), response.headers.get('content-type') ?? '<missing>');
  expect('portal keeps colorful composition C', body.includes('ANLAN.STORE') && body.includes('DODGE HO.<br>BUILDS IN PUBLIC.') && body.includes('id="signal-lattice"'));
  expect('portal clearly labels the personal LinkedIn link', body.includes('https://www.linkedin.com/in/lang-he-a94655120/') && body.includes('My LinkedIn profile'));
  expect('portal links the complete archive', body.includes('href="/projects/"'));
  expect('HeatStack remains first', body.indexOf('"name":"HeatStack"') < body.indexOf('"name":"PulseBoard"'));
  expect('ISPM remains unlinked from the homepage', !body.includes('href="/ispm/"') && !body.includes('"route":"/ispm/"'));
  for (const hash of ['#en', '#zh', '#zh-hans', '#zh-hant', '#ja']) {
    expect('portal supports ' + hash, body.toLowerCase().includes(`'${hash}'`) || body.toLowerCase().includes(`"${hash}"`));
  }
  expect('portal keeps four language controls', ['en', 'zh-Hant', 'zh-Hans', 'ja'].every((locale) => body.includes(`data-locale="${locale}"`)));
  expect('portal links existing application routes', ['/heatstack/', '/demo/', '/jobs/', '/saa/', '/sap/'].every((path) => body.includes(path)));
  expect('portal has JSON-LD', body.includes('type="application/ld+json"'));
}

async function verifyArchive(path, languageMarker) {
  const { response, body } = await fetchText(path);
  expect(path + ' returns 200', response.status === 200, response.status + ' ' + response.statusText);
  expect(path + ' is HTML', (response.headers.get('content-type') ?? '').includes('text/html'));
  const archiveRows = (body.match(/<article class="archive-row"/g) ?? []).length;
  expect(path + ' has 73 archive rows', archiveRows === 73, String(archiveRows));
  expect(path + ' has search, filters, and sorting', body.includes('data-project-search') && body.includes('data-project-filter="featured"') && body.includes('data-project-filter="private"') && body.includes('data-project-filter="fork"') && body.includes('data-project-sort'));
  expect(path + ' uses the expected language', body.includes(languageMarker));
  const privateRow = rowFor(body, 'RogerPhysics');
  expect(path + ' contains a locked private record', privateRow?.includes('data-visibility="private"') && privateRow.includes('Private repository · access unavailable'));
  expect(path + ' private record has no action or GitHub URL', privateRow && !privateRow.includes('class="row-action"') && !privateRow.includes('github.com'));
  const forkRow = rowFor(body, 'PathPlanning');
  expect(path + ' marks forks clearly', forkRow?.includes('data-origin="fork"') && forkRow.includes('Fork'));
  const publicRow = rowFor(body, 'VMD_cpp');
  expect(path + ' gives public repositories a GitHub action', publicRow?.includes('https://github.com/DodgeHo/VMD_cpp'));
  verifyMetadata(body, path);
}

async function verifyProjectLibrary() {
  for (const [path, marker] of [
    ['/projects/', 'Complete Engineering Archive'],
    ['/zh-hans/projects/', '完整工程资产档案'],
    ['/zh-hant/projects/', '完整工程資產檔案'],
    ['/ja/projects/', '完全なエンジニアリング資産目録']
  ]) await verifyArchive(path, marker);

  for (const path of ['/projects/pulseboard/', '/projects/heatstack/', '/projects/career-radar/']) {
    const { response, body } = await fetchText(path);
    expect(path + ' flagship case returns 200', response.status === 200, response.status + ' ' + response.statusText);
    expect(path + ' contains case study sections', body.includes('Problem') && body.includes('My role') && body.includes('Key decisions') && body.includes('Engineering evidence'));
    verifyMetadata(body, path);
  }

  const asset = await fetchText('/projects/pulseboard/deployment-runbook/');
  expect('PulseBoard asset returns 200', asset.response.status === 200, asset.response.status + ' ' + asset.response.statusText);
  expect('PulseBoard asset is labeled', asset.body.includes('Deployment Runbook') && asset.body.includes('public, security-reviewed explanation'));

  const publicRecord = await fetchText('/projects/vmd-cpp/');
  expect('public source project record returns 200', publicRecord.response.status === 200, publicRecord.response.status + ' ' + publicRecord.response.statusText);
  expect('public source project record links GitHub', publicRecord.body.includes('https://github.com/DodgeHo/VMD_cpp'));

  for (const path of ['/sitemap.xml', '/robots.txt', '/feed.xml']) {
    const { response, body } = await fetchText(path);
    expect(path + ' returns 200', response.status === 200, response.status + ' ' + response.statusText);
    expect(path + ' is nonempty', body.length > 50);
    expect(path + ' contains no private GitHub URL', !privateNames.some((name) => body.includes(`github.com/DodgeHo/${name}`)));
  }
}

async function verifyPulseBoard() {
  const app = await fetchText('/demo/frontend/');
  expect('PulseBoard customer surface returns 200', app.response.status === 200, app.response.status + ' ' + app.response.statusText);
  expect('PulseBoard customer surface retains app shell', app.body.includes('PulseBoard') || app.body.includes('root'));

  const live = await fetchJson('/demo/health/live');
  expect('liveness returns 200', live.response.status === 200, live.response.status + ' ' + live.response.statusText);
  expect('liveness body status is ok', live.json?.status === 'ok', live.body.slice(0, 160));

  const ready = await fetchJson('/demo/health/ready');
  expect('readiness returns 200', ready.response.status === 200, ready.response.status + ' ' + ready.response.statusText);
  expect('readiness body status is ready', ready.json?.status === 'ready', ready.body.slice(0, 160));

  const openapi = await fetchJson('/demo/openapi.json');
  const paths = openapi.json?.paths && typeof openapi.json.paths === 'object' ? Object.keys(openapi.json.paths) : [];
  expect('OpenAPI returns 200', openapi.response.status === 200, openapi.response.status + ' ' + openapi.response.statusText);
  expect('OpenAPI keeps public and protected routes', ['/demo/health/live', '/demo/health/ready', '/demo/api/v1/api-keys', '/demo/api/v1/workspaces'].every((path) => paths.includes(path)));

  const unauthorized = await fetchJson('/demo/api/v1/workspaces');
  expect('protected workspace route returns 401 without API key', unauthorized.response.status === 401, unauthorized.response.status + ' ' + unauthorized.response.statusText);
  expect('protected workspace route does not leak data', !Array.isArray(unauthorized.json), unauthorized.body.slice(0, 160));
}

async function verifyApplicationRoutes() {
  const heatStack = await fetchText('/heatstack/');
  expect('HeatStack returns 200', heatStack.response.status === 200, heatStack.response.status + ' ' + heatStack.response.statusText);
  expect('HeatStack identity is present', heatStack.body.includes('HeatStack') && heatStack.body.includes('AI 热栈'));

  const heatHealth = await fetchJson('/heatstack/api/v1/health');
  expect('HeatStack health returns 200', heatHealth.response.status === 200, heatHealth.response.status + ' ' + heatHealth.response.statusText);
  expect('HeatStack health identifies the service', heatHealth.json?.service === 'heatstack-api');

  const career = await fetchText('/jobs/login');
  expect('Career Radar login returns 200', career.response.status === 200, career.response.status + ' ' + career.response.statusText);
  expect('Career Radar identity is present', career.body.includes('Career Radar'));

  for (const path of ['/saa/', '/sap/', '/ispm/']) {
    const { response, body } = await fetchText(path);
    expect(path + ' returns 200', response.status === 200, response.status + ' ' + response.statusText);
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
  await verifyProjectLibrary();
  await verifyPulseBoard();
  await verifyApplicationRoutes();
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

console.log('ANLAN.STORE portal, complete project archive, flagship cases, and preserved application routes verified.');
