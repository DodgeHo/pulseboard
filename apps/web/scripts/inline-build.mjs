import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const repoRoot = resolve(appRoot, '..', '..');

const template = await readFile(resolve(appRoot, 'src', 'index.html'), 'utf8');
const css = await readFile(resolve(appRoot, 'src', 'styles.css'), 'utf8');
const i18n = await readFile(resolve(appRoot, 'dist', 'assets', 'i18n.js'), 'utf8');
const main = await readFile(resolve(appRoot, 'dist', 'assets', 'main.js'), 'utf8');

const inlineI18n = i18n
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ')
  .replace(/export \{\};?/g, '');
const inlineMain = main.replace(/import[^;]+from ['"]\.\/i18n\.js['"];?\s*/g, '');
const js = `${inlineI18n}\n${inlineMain}`;

const html = template
  .replace('__PULSEBOARD_CSS__', css.trim())
  .replace('__PULSEBOARD_JS__', js.trim());

const webDist = resolve(appRoot, 'dist');
const deployDist = resolve(repoRoot, 'deploy', 'anlan');

await mkdir(webDist, { recursive: true });
await mkdir(deployDist, { recursive: true });
await writeFile(resolve(webDist, 'index.html'), html, 'utf8');
await writeFile(resolve(deployDist, 'index.html'), html, 'utf8');

await rm(resolve(appRoot, 'dist', 'assets'), { recursive: true, force: true });

console.log(`Built ${resolve(webDist, 'index.html')}`);
console.log(`Updated ${resolve(deployDist, 'index.html')}`);
