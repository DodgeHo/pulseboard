import { readFile, readdir, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog, localeList } from "./lib/catalog.mjs";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = resolve(packageRoot, "../..");
const localRoot = resolve(packageRoot, "dist");
const deployRoot = resolve(repositoryRoot, "deploy/anlan");
const { snapshot, projects, repositories, caseStudies } = await loadCatalog(packageRoot);

const expectedInitialCounts = { total: 70, public: 57, private: 13, forks: 21, original: 49 };
const localePrefixes = { en: "", "zh-Hant": "zh-hant/", "zh-Hans": "zh-hans/", ja: "ja/" };
const flagshipSlugs = ["pulseboard", "heatstack", "career-radar"];
const scanExtensions = new Set([".html", ".xml", ".json", ".js", ".map"]);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const read = (root, relativePath) => readFile(resolve(root, relativePath), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function listFiles(root) {
  const files = [];
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (scanExtensions.has(extname(entry.name))) files.push(path);
    }
  };
  await visit(root);
  return files;
}

function rowsFrom(artifact) {
  return [...artifact.matchAll(/<article class="archive-row"[\s\S]*?<\/article>/g)].map((match) => match[0]);
}

function rowName(row) {
  return row.match(/\bdata-name="([^"]+)"/)?.[1] ?? "";
}

function verifyPageMetadata(artifact, label) {
  assert(/<title>[^<]+<\/title>/.test(artifact), `${label} is missing a title`);
  assert(artifact.includes('<meta name="description"'), `${label} is missing a description`);
  assert(artifact.includes('<link rel="canonical"'), `${label} is missing a canonical URL`);
  assert(artifact.includes('<meta property="og:title"'), `${label} is missing Open Graph metadata`);
  for (const locale of ["en", "zh-Hant", "zh-Hans", "ja", "x-default"]) {
    assert(artifact.includes(`hreflang="${locale}"`), `${label} is missing hreflang ${locale}`);
  }
  assert(artifact.includes('type="application/ld+json"'), `${label} is missing JSON-LD`);
  assert(!/__[A-Z0-9_]+__/.test(artifact), `${label} contains an unresolved build placeholder`);
}

function verifyInventoryCounts() {
  for (const [key, expected] of Object.entries(expectedInitialCounts)) {
    assert(snapshot.counts[key] === expected, `Initial inventory ${key} mismatch: expected ${expected}, found ${snapshot.counts[key]}`);
  }
  assert(snapshot.repositories.length === snapshot.counts.total, "Inventory count does not match repository records");
  assert(new Set(snapshot.repositories.map((repository) => repository.name)).size === snapshot.counts.total, "Inventory repository names are not unique");
  assert(repositories.filter((repository) => repository.visibility === "public").length === snapshot.counts.public, "Public repository count is inconsistent");
  assert(repositories.filter((repository) => repository.visibility === "private").length === snapshot.counts.private, "Private repository count is inconsistent");
  assert(repositories.filter((repository) => repository.origin === "fork").length === snapshot.counts.forks, "Fork count is inconsistent");
  assert(projects.length === snapshot.counts.total + 3, `Archive should contain ${snapshot.counts.total + 3} records, found ${projects.length}`);
}

async function verifyArchive(root, relativePath, locale) {
  const artifact = await read(root, relativePath);
  const rows = rowsFrom(artifact);
  const names = rows.map(rowName);
  assert(rows.length === projects.length, `${relativePath} should contain ${projects.length} archive rows, found ${rows.length}`);
  assert(new Set(names).size === rows.length, `${relativePath} contains duplicate archive records`);

  for (const repository of repositories) {
    assert(names.filter((name) => name === repository.name).length === 1, `${relativePath} must contain ${repository.name} exactly once`);
  }

  for (const repository of repositories.filter((candidate) => candidate.visibility === "public")) {
    const row = rows.find((candidate) => rowName(candidate) === repository.name);
    assert(row?.includes(`href="${repository.githubUrl}"`), `${relativePath} is missing the public GitHub action for ${repository.name}`);
  }

  for (const repository of repositories.filter((candidate) => candidate.visibility === "private")) {
    const row = rows.find((candidate) => rowName(candidate) === repository.name);
    assert(row?.includes('data-visibility="private"'), `${relativePath} is missing the private visibility marker for ${repository.name}`);
    assert(row?.includes("Private repository · access unavailable"), `${relativePath} is missing the locked explanation for ${repository.name}`);
    assert(!row?.includes("github.com"), `${relativePath} exposes a GitHub link for private repository ${repository.name}`);
    assert(!row?.includes('class="row-action"'), `${relativePath} renders a fake action for private repository ${repository.name}`);
  }

  for (const repository of repositories.filter((candidate) => candidate.origin === "fork")) {
    const row = rows.find((candidate) => rowName(candidate) === repository.name);
    assert(row?.includes('data-origin="fork"'), `${relativePath} is missing the fork data marker for ${repository.name}`);
    assert(/Fork(?: \/ (?:contribution|貢獻|贡献))?/.test(row ?? ""), `${relativePath} is missing a visible fork label for ${repository.name}`);
  }

  assert(artifact.includes("data-project-search"), `${relativePath} is missing project search`);
  assert(artifact.includes('data-project-filter="featured"'), `${relativePath} is missing featured filtering`);
  assert(artifact.includes('data-project-filter="private"'), `${relativePath} is missing private filtering`);
  assert(artifact.includes('data-project-filter="fork"'), `${relativePath} is missing fork filtering`);
  assert(artifact.includes("data-project-sort"), `${relativePath} is missing project sorting`);
  verifyPageMetadata(artifact, `${locale} archive`);
}

async function verifyGeneratedPages(root) {
  const home = await read(root, "index.html");
  assert(home.includes("ANLAN.STORE") && home.includes('id="signal-lattice"'), "Homepage lost composition C identity");
  assert(home.includes("https://www.linkedin.com/in/lang-he-a94655120/") && home.includes("My LinkedIn profile"), "Homepage lost the labeled LinkedIn profile control");
  assert(home.includes('href="/projects/"'), "Homepage does not link to the complete archive");
  assert(home.indexOf('"name":"HeatStack"') < home.indexOf('"name":"PulseBoard"'), "HeatStack is not first in the homepage project data");
  assert(!home.includes('href="/ispm/"') && !home.includes('route:"/ispm/"'), "Homepage must not expose an ISPM route");
  for (const hash of ["#en", "#zh", "#zh-hans", "#zh-hant", "#ja"]) {
    assert(home.toLowerCase().includes(`'${hash}'`) || home.toLowerCase().includes(`"${hash}"`), `Homepage is missing language hash ${hash}`);
  }
  assert(home.includes('<script type="application/ld+json">'), "Homepage is missing JSON-LD");
  assert(!/__[A-Z0-9_]+__/.test(home), "Homepage contains an unresolved build placeholder");

  for (const locale of localeList) {
    const prefix = localePrefixes[locale];
    await verifyArchive(root, `${prefix}projects/index.html`, locale);
    for (const slug of flagshipSlugs) {
      const detail = await read(root, `${prefix}projects/${slug}/index.html`);
      verifyPageMetadata(detail, `${locale} ${slug} case study`);
      for (const asset of caseStudies[slug].assets) {
        const assetArtifact = await read(root, `${prefix}projects/${slug}/${asset}/index.html`);
        verifyPageMetadata(assetArtifact, `${locale} ${slug} ${asset}`);
      }
    }
  }

  const sitemap = await read(root, "sitemap.xml");
  const robots = await read(root, "robots.txt");
  const feed = await read(root, "feed.xml");
  for (const slug of flagshipSlugs) assert(sitemap.includes(`https://anlan.store/projects/${slug}/`), `Sitemap is missing ${slug}`);
  assert(!repositories.filter((repository) => repository.visibility === "private").some((repository) => sitemap.includes(`/projects/${repository.slug}/`)), "Sitemap includes an unpublished private project page");
  assert(robots.includes("Sitemap: https://anlan.store/sitemap.xml"), "robots.txt is missing the sitemap URL");
  assert(feed.includes("ANLAN.STORE Project Updates") && flagshipSlugs.every((slug) => feed.includes(`/projects/${slug}/`)), "RSS feed is missing flagship project updates");
}

async function verifyNoPrivateLeaks(root) {
  const privateRepositories = repositories.filter((repository) => repository.visibility === "private");
  for (const path of await listFiles(root)) {
    const artifact = await readFile(path, "utf8");
    assert(!artifact.includes("api.github.com"), `${path} contains a GitHub API address`);
    for (const repository of privateRepositories) {
      const name = escapeRegExp(repository.name);
      const privateAddress = new RegExp(`(?:https?://)?(?:www\\.)?github\\.com/DodgeHo/${name}(?:\\.git)?(?:[/\\?#\\s"']|$)`, "i");
      assert(!privateAddress.test(artifact), `${path} leaks a private repository address for ${repository.name}`);
    }
  }
}

verifyInventoryCounts();
for (const root of [localRoot, deployRoot]) {
  await verifyGeneratedPages(root);
  await verifyNoPrivateLeaks(root);
  const metadata = await stat(resolve(root, "index.html"));
  assert(metadata.size > 100_000, `${root}/index.html is unexpectedly small: ${metadata.size} bytes`);
  console.log(`Verified ${root}: ${snapshot.counts.total} repositories, ${projects.length} archive records, private URLs absent.`);
}
