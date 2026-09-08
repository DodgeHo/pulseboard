import { readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../../..');
const artifactPath = resolve(repoRoot, 'deploy/anlan/demo/index.html');
const frontendArtifactPath = resolve(repoRoot, 'deploy/anlan/demo/frontend/index.html');
const reviewArtifactPath = resolve(repoRoot, 'deploy/anlan/demo/review/index.html');
const html = await readFile(artifactPath, 'utf8');
const frontendHtml = await readFile(frontendArtifactPath, 'utf8');
const reviewHtml = await readFile(reviewArtifactPath, 'utf8');
const failures = [];

function expect(name, condition) {
  if (!condition) failures.push(name);
}

const localeOrderNeedle = "const localeOrder = ['en', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'ar', 'zh-CN'];";
const oldStyleNeedles = [
  'gradient-text',
  'towerCore',
  'camera-x',
  'Opening orbit: software factory floor',
  'Scroll-driven 3D storytelling',
  'vertical-tower-preview',
  'Reliability Desk',
  'Evidence Rail',
];
const mojibakeNeedles = ['銆', '鞚', '谩', '帽', '鈫', '�'];
const frontendLocaleNeedles = [
  'PulseBoard 可靠性工作台',
  'バックエンドの信頼性',
  '백엔드 신뢰성',
  'Convierte la fiabilidad',
  'Transformer la fiabilité',
  'Backend Reliability wird',
  'Transforme confiabilidade',
  'حوّل موثوقية الخلفية',
];

expect('generated root artifact exists', html.length > 10000);
expect('generated frontend artifact exists', frontendHtml.length > 10000);
expect('generated review artifact exists', reviewHtml.length > 10000);

expect('root homepage uses Live Ops Console title', html.includes('<title>PulseBoard - Live Ops Console</title>'));
expect('root homepage uses Live Ops Console brand', html.includes('Live Ops Console'));
expect('root homepage has operational hero copy', html.includes('PulseBoard Live Ops Console.') && html.includes('A backend portfolio you can interrogate.'));
expect('root homepage surfaces probe terminal', html.includes('probe terminal') && html.includes('probe-console'));
expect('root homepage surfaces deploy gate', html.includes('deploy gate') && html.includes('backup -> nginx test -> reload'));
expect('root homepage surfaces runtime ledger', html.includes('Runtime Ledger') && html.includes('PostgreSQL') && html.includes('Redis'));
expect('root homepage surfaces incident runway', html.includes('Incident Runway'));
expect('root homepage probes liveness endpoint', html.includes('/demo/health/live'));
expect('root homepage probes readiness endpoint', html.includes('/demo/health/ready'));
expect('root homepage probes OpenAPI endpoint', html.includes('/demo/openapi.json'));
expect('root homepage links API docs endpoint', html.includes('/demo/docs'));
expect('root homepage links customer view', html.includes('href="/demo/frontend/"'));
expect('root homepage keeps English as first/default locale', html.includes(localeOrderNeedle));
expect('root homepage sets Arabic RTL direction', html.includes("currentLocale === 'ar' ? 'rtl' : 'ltr'"));

expect('frontend customer site uses Reliability Works title', frontendHtml.includes('<title>PulseBoard Reliability Works</title>'));
expect('frontend customer site uses Reliability Works brand', frontendHtml.includes('PulseBoard Reliability Works'));
expect('frontend customer site links backend proof', frontendHtml.includes('Backend proof') && frontendHtml.includes('href="/demo/"'));
expect('frontend customer site supports full locale list', frontendHtml.includes(localeOrderNeedle));
expect('frontend customer site supports RTL Arabic', frontendHtml.includes("active === 'ar' ? 'rtl' : 'ltr'"));
expect('frontend customer site updates URL when language changes', frontendHtml.includes('persistQuery') && frontendHtml.includes("searchParams.set('lang', active)"));
expect('frontend customer site includes workflow sections', frontendHtml.includes('Workflow') && frontendHtml.includes('Automation queue') && frontendHtml.includes('Evidence links'));
expect('frontend customer site includes release and lifecycle sections', frontendHtml.includes('Release posture') && frontendHtml.includes('Lifecycle'));
expect('frontend customer site includes pricing and FAQ sections', frontendHtml.includes('Starter') && frontendHtml.includes('Platform') && frontendHtml.includes('Built to be inspected.'));
expect('frontend customer site surfaces backend infrastructure', frontendHtml.includes('PostgreSQL / Redis + BullMQ') && frontendHtml.includes('/demo/health/ready') && frontendHtml.includes('/demo/openapi.json'));

expect('review page has its own title and canonical', reviewHtml.includes('<title>PulseBoard - Engineering Review Path</title>') && reviewHtml.includes('https://anlan.store/demo/review/'));
expect('review page starts with recruiter-friendly summary', reviewHtml.includes('For recruiters and hiring managers') && reviewHtml.includes('Reliable software, explained clearly.') && reviewHtml.includes('Start with the 60-second overview'));
expect('review page links preserved public routes', ['/demo/', '/demo/frontend/', '/demo/docs', '/demo/openapi.json', '/demo/health/live', '/demo/health/ready'].every((path) => reviewHtml.includes(path)));
expect('review page includes review path and claim evidence', reviewHtml.includes('A 10-minute engineering review path') && reviewHtml.includes('Durable incident processing') && reviewHtml.includes('Tenant boundaries') && reviewHtml.includes('Operational readiness') && reviewHtml.includes('Deployment discipline'));
expect('review page includes honest boundaries', reviewHtml.includes('production-shaped portfolio project') && reviewHtml.includes('Mock-compatible transports') && reviewHtml.includes('Backup/restore and rollback are rehearsals') && reviewHtml.includes('AWS stays plan-only'));
expect('review page includes mobile-safe architecture section', reviewHtml.includes('review-architecture') && reviewHtml.includes('Browser / static surface') && reviewHtml.includes('Audit / metrics / outbox'));
expect('review page includes all public probe paths', ['/demo/health/live', '/demo/health/ready', '/demo/openapi.json', '/demo/docs'].every((path) => reviewHtml.includes(path)));
expect('review page includes all locale identifiers', localeOrderNeedle && reviewHtml.includes('zh-TW') && reviewHtml.includes('zh-CN') && reviewHtml.includes('ja') && reviewHtml.includes('ar'));

for (const needle of frontendLocaleNeedles) {
  expect('frontend customer site includes translated text: ' + needle, frontendHtml.includes(needle));
}

for (const needle of oldStyleNeedles) {
  expect('generated artifacts retired old marker: ' + needle, !html.includes(needle) && !frontendHtml.includes(needle));
}

for (const needle of mojibakeNeedles) {
  expect('generated root artifact has no mojibake marker ' + needle, !html.includes(needle));
  expect('generated frontend artifact has no mojibake marker ' + needle, !frontendHtml.includes(needle));
}

const scriptMatch = html.match(/<script type="module">(?<script>[\s\S]*)<\/script>/);
expect('generated root inline script can be extracted', Boolean(scriptMatch?.groups?.script));

if (scriptMatch?.groups?.script) {
  const tempScript = join(tmpdir(), 'pulseboard-web-artifact-' + Date.now() + '.js');
  await writeFile(tempScript, scriptMatch.groups.script, 'utf8');
  const check = spawnSync(process.execPath, ['--check', tempScript], { encoding: 'utf8' });
  await rm(tempScript, { force: true });
  expect('generated root inline script parses (' + (check.stderr || check.stdout || 'node --check failed') + ')', check.status === 0);
}

const frontendScriptMatch = frontendHtml.match(/<script>(?<script>[\s\S]*)<\/script>\s*<\/body>/);
expect('generated frontend inline script can be extracted', Boolean(frontendScriptMatch?.groups?.script));

if (frontendScriptMatch?.groups?.script) {
  const tempScript = join(tmpdir(), 'pulseboard-frontend-artifact-' + Date.now() + '.js');
  await writeFile(tempScript, frontendScriptMatch.groups.script, 'utf8');
  const check = spawnSync(process.execPath, ['--check', tempScript], { encoding: 'utf8' });
  await rm(tempScript, { force: true });
  expect('generated frontend inline script parses (' + (check.stderr || check.stdout || 'node --check failed') + ')', check.status === 0);
}

const reviewScriptMatch = reviewHtml.match(/<script type="module">(?<script>[\s\S]*)<\/script>/);
expect('generated review inline script can be extracted', Boolean(reviewScriptMatch?.groups?.script));

if (reviewScriptMatch?.groups?.script) {
  const tempScript = join(tmpdir(), 'pulseboard-review-artifact-' + Date.now() + '.js');
  await writeFile(tempScript, reviewScriptMatch.groups.script, 'utf8');
  const check = spawnSync(process.execPath, ['--check', tempScript], { encoding: 'utf8' });
  await rm(tempScript, { force: true });
  expect('generated review inline script parses (' + (check.stderr || check.stdout || 'node --check failed') + ')', check.status === 0);
}

if (failures.length > 0) {
  console.error('PulseBoard web artifact verification failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('PulseBoard web artifact verified: ' + artifactPath);
console.log('PulseBoard frontend artifact verified: ' + frontendArtifactPath);
console.log('PulseBoard review artifact verified: ' + reviewArtifactPath);
