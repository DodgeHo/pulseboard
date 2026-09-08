import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const repoRoot = resolve(appRoot, '..', '..');

const readText = async (path) => (await readFile(path, 'utf8')).replace(/\r\n?/g, '\n');

const template = await readText(resolve(appRoot, 'src', 'index.html'));
const frontendTemplate = await readText(resolve(appRoot, 'src', 'frontend.html'));
const reviewTemplate = await readText(resolve(appRoot, 'src', 'review.html'));
const css = await readText(resolve(appRoot, 'src', 'styles.css'));
const reviewCss = await readText(resolve(appRoot, 'src', 'review.css'));
const i18n = await readText(resolve(appRoot, 'dist', 'assets', 'i18n.js'));
const main = await readText(resolve(appRoot, 'dist', 'assets', 'main.js'));
const review = await readText(resolve(appRoot, 'dist', 'assets', 'review.js'));

const inlineI18n = i18n
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ')
  .replace(/export \{\};?/g, '');
const inlineMain = main.replace(/import[^;]+from ['"]\.\/i18n\.js['"];?\s*/g, '');
const js = `${inlineI18n}\n${inlineMain}`;
const inlineReview = review.replace(/import[^;]+from ['"]\.\/i18n\.js['"];?\s*/g, '');

const html = template
  .replace('__PULSEBOARD_CSS__', css.trim())
  .replace('__PULSEBOARD_JS__', js.trim());

const reviewHtml = reviewTemplate
  .replace('__PULSEBOARD_REVIEW_CSS__', reviewCss.trim())
  .replace('__PULSEBOARD_REVIEW_JS__', `${inlineI18n}\n${inlineReview}`.trim());

const webDist = resolve(appRoot, 'dist');
const deployDist = resolve(repoRoot, 'deploy', 'anlan', 'demo');

await mkdir(webDist, { recursive: true });
await mkdir(resolve(webDist, 'frontend'), { recursive: true });
await mkdir(resolve(webDist, 'review'), { recursive: true });
await mkdir(deployDist, { recursive: true });
await mkdir(resolve(deployDist, 'frontend'), { recursive: true });
await mkdir(resolve(deployDist, 'review'), { recursive: true });
await writeFile(resolve(webDist, 'index.html'), html, 'utf8');
await writeFile(resolve(webDist, 'frontend', 'index.html'), frontendTemplate, 'utf8');
await writeFile(resolve(webDist, 'review', 'index.html'), reviewHtml, 'utf8');
await writeFile(resolve(deployDist, 'index.html'), html, 'utf8');
await writeFile(resolve(deployDist, 'frontend', 'index.html'), frontendTemplate, 'utf8');
await writeFile(resolve(deployDist, 'review', 'index.html'), reviewHtml, 'utf8');

await rm(resolve(appRoot, 'dist', 'assets'), { recursive: true, force: true });

console.log(`Built ${resolve(webDist, 'index.html')}`);
console.log(`Updated ${resolve(deployDist, 'index.html')}`);
