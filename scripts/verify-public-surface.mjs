const baseUrl = normalizeBaseUrl(process.env.PUBLIC_BASE_URL ?? 'https://anlan.store');
const expectedReleaseSha = process.env.EXPECTED_RELEASE_SHA?.trim();
const failures = [];
const observations = [];
const privateNames = [
  'careerforge-autoapply', 'DSP_EPFL', 'interval_map', 'leaverequests', 'littlelemon',
  'motion_example', 'myLittleLemon', 'P1117', 'PAL3_debug', 'PAL3_translation',
  'PAL4_translation', 'RogerPhysics', 'ros'
];
const homeOrder = ['HeatStack', 'TapPhysics', 'Career Radar', 'PuzzleWear', 'CWC', 'PulseBoard', 'SAA Practice', 'SAP Practice', 'ISPM Practice', 'PAL4 translation', 'IELTS writing GPT', 'Dynamic RRT Connect', 'VMD', 'CEEMDAN', 'DevEnglish'];
const vmdHomeUrls = ['https://github.com/DodgeHo/VMD_cpp', 'https://github.com/DodgeHo/VMD_2D_python', 'https://github.com/DodgeHo/VMD_2D_cpp'];
const puzzleWearUrl = 'https://puzzlewear.cn/login';
const requiredAuxiliaryNames = ['AI 热栈', '职海雷达', '一点物理', 'CellLoc Web Controller- 细胞定位网络控制系统', '拼频品聘-服装创意设计', '开发者英语练习站', '运营脉冲板', 'SAA Practice-亚马逊云做题练习', 'SAP Practice-亚马逊云做题练习'];
const auxiliaryNamesByLocale = {
  en: requiredAuxiliaryNames,
  'zh-Hans': requiredAuxiliaryNames,
  'zh-Hant': ['AI 熱棧', '職海雷達', '一點物理', 'CellLoc Web Controller- 細胞定位網路控制系統', '拼頻品聘-服裝創意設計', '開發者英語練習站', '營運脈衝板', 'SAA Practice-亞馬遜雲做題練習', 'SAP Practice-亞馬遜雲做題練習'],
  ja: ['AI 熱棧', '職海雷達', '一点物理', 'CellLoc Web Controller- 细胞定位网络控制系统', '拼频品聘-服装创意设计', '开发者英语练习站', '运营脉冲板', 'SAA Practice-亚马逊云做题练习', 'SAP Practice-亚马逊云做题练习']
};
const staleHeatStackCopy = ['portfolio projects', 'interview preparation', '作品项目', '面试准备', '作品集', '面試'];
const staleTapPhysicsCopy = ['evidence surface', '部署路由', '证据界面', '證據介面'];

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

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function includesAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

function excludesAll(haystack, needles) {
  return needles.every((needle) => !haystack.includes(needle));
}

function homeProjectBlock(body, name) {
  const start = body.indexOf(`"name":"${name}"`);
  if (start < 0) return '';
  const next = homeOrder.map((candidate) => body.indexOf(`"name":"${candidate}"`)).filter((index) => index > start).sort((a, b) => a - b)[0] ?? body.length;
  return body.slice(start, next);
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
  expect('portal keeps the GitHub profile control', body.includes('https://github.com/DodgeHo') && body.includes('github-link'));
  expect('portal links the complete archive', body.includes('href="/projects/"'));
  const homeIndexes = homeOrder.map((name) => body.indexOf(`"name":"${name}"`));
  expect('homepage contains all 15 curated projects', homeIndexes.every((index) => index >= 0), homeOrder.filter((_, index) => homeIndexes[index] < 0).join(', '));
  expect('homepage order matches required sequence', homeIndexes.every((index, position) => position === 0 || homeIndexes[position - 1] < index));
  expect('homepage contains one VMD family row', countOccurrences(body, '"name":"VMD"') === 1, String(countOccurrences(body, '"name":"VMD"')));
  for (const url of vmdHomeUrls) expect('homepage contains VMD URL ' + url, countOccurrences(body, url) === 1, String(countOccurrences(body, url)));
  expect('homepage excludes VMD_2D_CPP_OpenCV', !body.includes('VMD_2D_CPP_OpenCV'));
  expect('PAL4 homepage action precedes repository action', body.includes('https://dodgeho.github.io/PAL4_EnglishMod/') && body.indexOf('https://dodgeho.github.io/PAL4_EnglishMod/') < body.indexOf('https://github.com/DodgeHo/PAL4_EnglishMod'));
  expect('homepage has TapPhysics live route', body.includes('"route":"/tapphysics/"') && body.includes('"action":"/tapphysics/"'));
  expect('homepage has exact PuzzleWear login and DevEnglish URLs', body.includes(`"action":"${puzzleWearUrl}"`) && body.includes('https://devenglish.club/'));
  expect('homepage does not link PuzzleWear root URL', !body.includes('href="https://puzzlewear.cn/"'));
  expect('homepage contains required auxiliary names', includesAll(body, requiredAuxiliaryNames), requiredAuxiliaryNames.filter((name) => !body.includes(name)).join(', '));
  expect('homepage HeatStack copy is refreshed', excludesAll(homeProjectBlock(body, 'HeatStack'), staleHeatStackCopy));
  expect('homepage TapPhysics copy is refreshed', excludesAll(homeProjectBlock(body, 'TapPhysics'), staleTapPhysicsCopy));
  expect('homepage contains closed-source flags', ['CWC', 'PuzzleWear', 'DevEnglish', 'ISPM Practice'].every((name) => {
    const start = body.indexOf(`"name":"${name}"`);
    const next = homeIndexes.filter((index) => index > start).sort((a, b) => a - b)[0] ?? body.length;
    return start >= 0 && body.slice(start, next).includes('"closedSource":true');
  }));
  expect('ISPM remains unlinked from the homepage', !body.includes('href="/ispm/"') && !body.includes('"route":"/ispm/"'));
  expect('portal removed old Ten project signals copy', !body.includes('Ten project signals'));
  for (const hash of ['#en', '#zh', '#zh-hans', '#zh-hant', '#ja']) {
    expect('portal supports ' + hash, body.toLowerCase().includes(`'${hash}'`) || body.toLowerCase().includes(`"${hash}"`));
  }
  expect('portal keeps four language controls', ['en', 'zh-Hant', 'zh-Hans', 'ja'].every((locale) => body.includes(`data-locale="${locale}"`)));
  expect('portal links existing application routes', ['/heatstack/', '/tapphysics/', '/demo/', '/jobs/', '/saa/', '/sap/'].every((path) => body.includes(path)));
  expect('portal has JSON-LD', body.includes('type="application/ld+json"'));
}

async function verifyUpworkPages() {
  const entry = await fetchText('/upwork/');
  expect('Upwork entry returns 200', entry.response.status === 200, entry.response.status + ' ' + entry.response.statusText);
  expect('Upwork entry is English', entry.body.includes('<html lang="en">'));
  expect('Upwork entry explains the three work modes', ['React/Node Feature Delivery', 'AI-Generated Code Rescue', 'Backend/Reliability Work'].every((value) => entry.body.includes(value)));
  expect('Upwork entry links the three case pages', ['/upwork/feature-delivery/', '/upwork/ai-code-rescue/', '/upwork/backend-reliability/'].every((value) => entry.body.includes(`href="${value}"`)));
  expect('Upwork entry states demo boundaries', entry.body.includes('representative browser-only simulation') && entry.body.includes('production systems'));
  expect('Upwork entry has metadata', entry.body.includes('<link rel="canonical"') && entry.body.includes('<meta property="og:title"') && entry.body.includes('type="application/ld+json"'));

  for (const [path, title, demo, boundary] of [
    ['/upwork/feature-delivery/', 'React/Node Feature Delivery', 'data-demo="feature"', 'Representative browser demo'],
    ['/upwork/ai-code-rescue/', 'AI-Generated Code Rescue', 'data-demo="rescue"', 'Representative code-review demo'],
    ['/upwork/backend-reliability/', 'Backend/Reliability Work', 'data-demo="reliability"', 'Explicit reliability simulation']
  ]) {
    const { response, body } = await fetchText(path);
    expect(path + ' returns 200', response.status === 200, response.status + ' ' + response.statusText);
    expect(path + ' is English', body.includes('<html lang="en">'));
    expect(path + ' contains its title and demo', body.includes(title) && body.includes(demo));
    expect(path + ' contains case sections', ['Problem', 'Approach', 'Proof', 'Limits', 'Delivery signals'].every((value) => body.includes(value)));
    expect(path + ' states its evidence boundary', body.includes(boundary) && body.includes('No external'));
    expect(path + ' has metadata and no email or placeholder leak', body.includes('<link rel="canonical"') && body.includes('<meta property="og:title"') && body.includes('type="application/ld+json"') && !body.includes('mailto:') && !/__[A-Z0-9_]+__/.test(body));
  }
}

async function verifyHirePages() {
  for (const [path, lang, marker] of [
    ['/hire/', 'en', 'Dodge Ho / Lang He'],
    ['/zh-hant/hire/', 'zh-Hant', 'Dodge Ho / 道安瀾'],
    ['/zh-hans/hire/', 'zh-Hans', 'Dodge Ho / 道安澜'],
    ['/ja/hire/', 'ja', '道安瀾（ドッジ・ホー）']
  ]) {
    const { response, body } = await fetchText(path);
    expect(path + ' returns 200', response.status === 200, response.status + ' ' + response.statusText);
    expect(path + ' is HTML', (response.headers.get('content-type') ?? '').includes('text/html'));
    expect(path + ' uses the expected locale', body.includes(`<html lang="${lang}">`) && body.includes(marker));
    expect(path + ' exposes the complete recruiter reading path', ['id="approach"', 'id="evidence"', 'id="evidence-index"', 'id="review"', 'id="boundaries"', 'id="contact"'].every((value) => body.includes(value)));
    expect(path + ' contains PulseBoard engineering evidence', ['Hono API', 'PostgreSQL', 'Redis', 'BullMQ', 'OpenAPI', 'worker recovery'].every((value) => body.includes(value)));
    expect(path + ' contains honest public boundaries', ['production-shaped portfolio project', 'mock-compatible', 'AWS', 'RPO/RTO'].every((value) => body.includes(value)));
    expect(path + ' contains required review links', ['/demo/', '/demo/frontend/', '/demo/docs', '/demo/openapi.json', 'https://github.com/DodgeHo', 'https://www.linkedin.com/in/lang-he-a94655120/'].every((value) => body.includes(`href="${value}"`)));
    expect(path + ' has no hiring form or email leak', !body.includes('<form') && !body.includes('mailto:'));
    verifyMetadata(body, path);
  }
}

async function verifyArchive(path, languageMarker, lockedMarker, closedSourceMarker, expectIcp, locale) {
  const { response, body } = await fetchText(path);
  expect(path + ' returns 200', response.status === 200, response.status + ' ' + response.statusText);
  expect(path + ' is HTML', (response.headers.get('content-type') ?? '').includes('text/html'));
  const archiveRows = (body.match(/<article class="archive-row"/g) ?? []).length;
  expect(path + ' has 77 archive rows', archiveRows === 77, String(archiveRows));
  expect(path + ' has search, filters, and sorting', body.includes('data-project-search') && body.includes('data-project-filter="featured"') && body.includes('data-project-filter="private"') && body.includes('data-project-filter="fork"') && body.includes('data-project-sort'));
  expect(path + ' uses the expected language', body.includes(languageMarker));
  const privateRow = rowFor(body, 'RogerPhysics');
  expect(path + ' contains a locked private record', privateRow?.includes('data-visibility="private"') && privateRow.includes(lockedMarker));
  expect(path + ' private record has no action or GitHub URL', privateRow && !privateRow.includes('class="row-action"') && !privateRow.includes('github.com'));
  const forkRow = rowFor(body, 'PathPlanning');
  expect(path + ' marks forks clearly', forkRow?.includes('data-origin="fork"') && forkRow.includes('Fork'));
  const publicRow = rowFor(body, 'VMD_cpp');
  expect(path + ' gives public repositories a GitHub action', publicRow?.includes('https://github.com/DodgeHo/VMD_cpp'));
  for (const name of ['VMD_cpp', 'VMD_2D_python', 'VMD_2D_cpp', 'VMD_2D_CPP_OpenCV']) {
    expect(path + ' contains ' + name + ' once', (body.match(new RegExp(`data-name="${name}"`, 'g')) ?? []).length === 1);
  }
  expect(path + ' uses CEEMDAN_cpp spelling', body.includes('CEEMDAN_cpp'));
  expect(path + ' has TapPhysics /tapphysics/', rowFor(body, 'TapPhysics')?.includes('href="/tapphysics/"'));
  expect(path + ' has exact PuzzleWear login URL', rowFor(body, 'PuzzleWear')?.includes(`href="${puzzleWearUrl}"`));
  expect(path + ' does not link PuzzleWear root URL', !rowFor(body, 'PuzzleWear')?.includes('href="https://puzzlewear.cn/"'));
  expect(path + ' has DevEnglish URL', rowFor(body, 'DevEnglish')?.includes('href="https://devenglish.club/"'));
  expect(path + ' keeps CWC source private', !rowFor(body, 'CWC')?.includes('github.com'));
  expect(path + ' marks closed-source archive records', ['CWC', 'PuzzleWear', 'DevEnglish'].every((name) => rowFor(body, name)?.includes(closedSourceMarker)));
  expect(path + ' contains required auxiliary names', includesAll(body, auxiliaryNamesByLocale[locale]), auxiliaryNamesByLocale[locale].filter((name) => !body.includes(name)).join(', '));
  expect(path + ' HeatStack row copy is refreshed', excludesAll(rowFor(body, 'HeatStack') ?? '', staleHeatStackCopy));
  expect(path + ' TapPhysics row copy is refreshed', excludesAll(rowFor(body, 'TapPhysics') ?? '', staleTapPhysicsCopy));
  expect(path + ' ICP visibility is correct', expectIcp ? body.includes('粤ICP备2026035259号-1') : !body.includes('粤ICP备2026035259号-1'));
  verifyMetadata(body, path);
}

async function verifyProjectLibrary() {
  for (const [path, marker, lockedMarker, closedSourceMarker, expectIcp, locale] of [
    ['/projects/', 'Complete Engineering Archive', 'Private repository · access unavailable', 'Closed source', false, 'en'],
    ['/zh-hans/projects/', '完整工程资产档案', '私有仓库 · 无法公开访问', '闭源', true, 'zh-Hans'],
    ['/zh-hant/projects/', '完整工程資產檔案', '私人儲存庫 · 無法公開存取', '閉源', false, 'zh-Hant'],
    ['/ja/projects/', '完全なエンジニアリング資産目録', '非公開リポジトリ · アクセス不可', 'クローズドソース', false, 'ja']
  ]) await verifyArchive(path, marker, lockedMarker, closedSourceMarker, expectIcp, locale);

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

  const review = await fetchText('/demo/review/');
  expect('PulseBoard engineering review returns 200', review.response.status === 200, review.response.status + ' ' + review.response.statusText);
  expect('PulseBoard engineering review is HTML', (review.response.headers.get('content-type') ?? '').includes('text/html'));
  expect('PulseBoard engineering review has review title', review.body.includes('PulseBoard - Engineering Review Path'));
  expect('PulseBoard engineering review links public evidence', ['/demo/health/live', '/demo/health/ready', '/demo/openapi.json', '/demo/docs'].every((path) => review.body.includes(path)));
  expect('PulseBoard engineering review states honest boundaries', review.body.includes('production-shaped portfolio project') && review.body.includes('AWS stays plan-only'));

  const live = await fetchJson('/demo/health/live');
  expect('liveness returns 200', live.response.status === 200, live.response.status + ' ' + live.response.statusText);
  expect('liveness body status is ok', live.json?.status === 'ok', live.body.slice(0, 160));
  observe('/demo/health/live release', live.json?.release ?? '<missing>');
  if (expectedReleaseSha) {
    expect(
      'public liveness reports the deployed release',
      live.json?.release === expectedReleaseSha,
      `expected ${expectedReleaseSha}, received ${String(live.json?.release)}`,
    );
  }

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
  await verifyUpworkPages();
  await verifyHirePages();
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

console.log('ANLAN.STORE portal, multilingual hiring review, complete project archive, flagship cases, and preserved application routes verified.');
