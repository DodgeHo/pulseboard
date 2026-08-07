import { readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../../..');
const artifactPath = resolve(repoRoot, 'deploy/anlan/demo/index.html');
const frontendArtifactPath = resolve(repoRoot, 'deploy/anlan/demo/frontend/index.html');
const html = await readFile(artifactPath, 'utf8');
const frontendHtml = await readFile(frontendArtifactPath, 'utf8');
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

if (failures.length > 0) {
  console.error('PulseBoard web artifact verification failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('PulseBoard web artifact verified: ' + artifactPath);
console.log('PulseBoard frontend artifact verified: ' + frontendArtifactPath);
