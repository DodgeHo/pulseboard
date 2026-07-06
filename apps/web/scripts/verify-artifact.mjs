import { readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const repoRoot = resolve(appRoot, '..', '..');
const artifactPath = resolve(repoRoot, 'deploy', 'anlan', 'index.html');

const html = await readFile(artifactPath, 'utf8');
const frontendHtml = await readFile(resolve(repoRoot, 'deploy', 'anlan', 'frontend', 'index.html'), 'utf8');
const failures = [];
const text = (...codePoints) => String.fromCodePoint(...codePoints);

const traditionalChineseLabel = text(0x7e41, 0x9ad4, 0x4e2d, 0x6587);
const simplifiedChineseLabel = text(0x7b80, 0x4f53, 0x4e2d, 0x6587);
const arabicLabel = text(0x0627, 0x0644, 0x0639, 0x0631, 0x0628, 0x064a, 0x0629);
const mojibakeNeedles = [
  text(0x921, 0x6a5),
  text(0x921, 0x6ab),
  text(0x93a, 0x57fa),
  text(0x7efb, 0x4fbb),
  text(0x6d93),
  text(0xfffd),
];

function expect(name, condition) {
  if (!condition) failures.push(name);
}

expect('generated artifact has app root', html.includes('id="app"'));
expect('generated artifact has inline stylesheet', html.includes('<style>') && !html.includes('__PULSEBOARD_CSS__'));
expect('generated artifact has inline module script', html.includes('<script type="module">') && !html.includes('__PULSEBOARD_JS__'));
expect('generated artifact has no unbundled i18n import', !/from ['"]\.\/i18n\.js['"]/.test(html));
expect('generated artifact has no TypeScript import declaration', !/import\s+\{/.test(html));
expect('generated artifact keeps English as first/default locale', html.includes("const localeOrder = ['en', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'ar', 'zh-CN'];"));
expect('generated artifact exposes Traditional Chinese', html.includes(traditionalChineseLabel));
expect('generated artifact exposes Simplified Chinese last locale', html.includes(simplifiedChineseLabel));
expect('generated artifact exposes Arabic locale', html.includes(arabicLabel));
expect('generated artifact title identifies frontend and backend demo', html.includes('<title>PulseBoard - Frontend + Backend Demo</title>'));
expect('generated artifact surfaces frontend plane', html.includes('Frontend plane'));
expect('generated artifact links customer-facing frontend site', html.includes('Open customer-facing site') && html.includes('href="/frontend/"'));
expect('generated frontend customer site exists', frontendHtml.includes('<title>PulseBoard Operations Cloud - Customer Site</title>'));
expect('generated frontend customer site has commercial content', frontendHtml.includes('Book a product demo') && frontendHtml.includes('Pricing') && frontendHtml.includes('Questions a buyer would actually ask'));
expect('generated frontend customer site links backend proof', frontendHtml.includes('Backend proof') && frontendHtml.includes('href="/"'));
expect('generated frontend customer site has language system', frontendHtml.includes('localeOrder') && frontendHtml.includes('zh-CN') && frontendHtml.includes('zh-TW'));
expect('generated artifact surfaces backend plane', html.includes('Backend plane'));
expect('generated artifact probes liveness endpoint', html.includes('/health/live'));
expect('generated artifact probes readiness endpoint', html.includes('/health/ready'));
expect('generated artifact probes OpenAPI endpoint', html.includes('/openapi.json'));
expect('generated artifact links API docs endpoint', html.includes('/docs'));
expect('generated artifact supports deterministic locale URL param', html.includes("get('lang')"));
expect('generated artifact sets Arabic RTL direction', html.includes("currentLocale === 'ar' ? 'rtl' : 'ltr'"));

for (const needle of mojibakeNeedles) {
  expect(`generated artifact has no mojibake marker U+${[...needle].map((char) => char.codePointAt(0).toString(16).toUpperCase()).join(' U+')}`, !html.includes(needle));
}

const scriptMatch = html.match(/<script type="module">(?<script>[\s\S]*)<\/script>/);
expect('generated artifact inline script can be extracted', Boolean(scriptMatch?.groups?.script));

if (scriptMatch?.groups?.script) {
  const tempScript = join(tmpdir(), `pulseboard-web-artifact-${Date.now()}.js`);
  await writeFile(tempScript, scriptMatch.groups.script, 'utf8');
  const check = spawnSync(process.execPath, ['--check', tempScript], { encoding: 'utf8' });
  await rm(tempScript, { force: true });
  expect(`generated artifact inline script parses (${check.stderr || check.stdout || 'node --check failed'})`, check.status === 0);
}

if (failures.length > 0) {
  console.error('PulseBoard web artifact verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PulseBoard web artifact verified: ${artifactPath}`);
