import { readFile, readdir, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { siteCopy } from "../content/site-copy.mjs";
import { upworkPortfolio } from "../content/upwork-copy.mjs";
import { loadCatalog, localeList } from "./lib/catalog.mjs";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = resolve(packageRoot, "../..");
const localRoot = resolve(packageRoot, "dist");
const deployRoot = resolve(repositoryRoot, "deploy/anlan");
const { snapshot, projects, repositories, caseStudies } = await loadCatalog(packageRoot);
const bySlug = new Map(projects.map((project) => [project.slug, project]));

const expectedInitialCounts = { total: 70, public: 57, private: 13, forks: 21, original: 49 };
const localePrefixes = { en: "", "zh-Hant": "zh-hant/", "zh-Hans": "zh-hans/", ja: "ja/" };
const flagshipSlugs = ["pulseboard", "heatstack", "career-radar"];
const homeOrder = ["HeatStack", "TapPhysics", "Career Radar", "PuzzleWear", "CWC", "PulseBoard", "SAA Practice", "SAP Practice", "ISPM Practice", "PAL4 translation", "IELTS writing GPT", "Dynamic RRT Connect", "VMD", "CEEMDAN", "DevEnglish"];
const vmdHomeUrls = ["https://github.com/DodgeHo/VMD_cpp", "https://github.com/DodgeHo/VMD_2D_python", "https://github.com/DodgeHo/VMD_2D_cpp"];
const puzzleWearUrl = "https://puzzlewear.cn/login";
const requiredAuxiliaryNames = ["AI 热栈", "职海雷达", "一点物理", "CellLoc Web Controller- 细胞定位网络控制系统", "拼频品聘-服装创意设计", "开发者英语练习站", "运营脉冲板", "SAA Practice-亚马逊云做题练习", "SAP Practice-亚马逊云做题练习"];
const staleHeatStackCopy = ["portfolio projects", "interview preparation", "作品项目", "面试准备", "作品集", "面試"];
const staleTapPhysicsCopy = ["evidence surface", "部署路由", "证据界面", "證據介面"];
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

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function assertIncludesAll(haystack, needles, label) {
  for (const needle of needles) assert(haystack.includes(needle), `${label} is missing ${needle}`);
}

function assertExcludesAll(haystack, needles, label) {
  for (const needle of needles) assert(!haystack.includes(needle), `${label} still contains stale copy: ${needle}`);
}

function homeProjectBlock(home, name) {
  const start = home.indexOf(`"name":"${name}"`);
  if (start < 0) return "";
  const next = homeOrder.map((candidate) => home.indexOf(`"name":"${candidate}"`)).filter((index) => index > start).sort((a, b) => a - b)[0] ?? home.length;
  return home.slice(start, next);
}

function localizedAuxiliaryName(project, locale) {
  return project.auxiliaryName?.[locale] || project.auxiliaryName?.en || "";
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

function verifyUpworkMetadata(artifact, label) {
  assert(artifact.includes('<html lang="en">'), `${label} must be English-only`);
  assert(artifact.includes('<link rel="canonical"'), `${label} is missing a canonical URL`);
  assert(artifact.includes('hreflang="en"') && artifact.includes('hreflang="x-default"'), `${label} is missing English alternate metadata`);
  assert(artifact.includes('type="application/ld+json"'), `${label} is missing JSON-LD`);
  assert(!/__[A-Z0-9_]+__/.test(artifact), `${label} contains an unresolved build placeholder`);
  assert(!artifact.includes("api.github.com"), `${label} contains a GitHub API address`);
  assert(!artifact.includes("mailto:"), `${label} publishes an unconfirmed email address`);
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
  assert(projects.length === snapshot.counts.total + projects.filter((project) => !repositories.some((repository) => repository.name === project.name)).length, "Archive records are not derived from repositories plus explicit project records");
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
    assert(row?.includes(siteCopy[locale].locked), `${relativePath} is missing the locked explanation for ${repository.name}`);
    assert(!row?.includes("github.com"), `${relativePath} exposes a GitHub link for private repository ${repository.name}`);
    assert(!row?.includes('class="row-action"'), `${relativePath} renders a fake action for private repository ${repository.name}`);
  }

  for (const name of ["CWC", "PuzzleWear", "DevEnglish"]) {
    const row = rows.find((candidate) => rowName(candidate) === name);
    assert(row?.includes(siteCopy[locale].closedSource), `${relativePath} is missing closed-source status for ${name}`);
  }

  for (const name of ["VMD_cpp", "VMD_2D_python", "VMD_2D_cpp", "VMD_2D_CPP_OpenCV"]) {
    assert(names.filter((candidate) => candidate === name).length === 1, `${relativePath} must contain ${name} exactly once`);
  }
  assert(artifact.includes("CEEMDAN_cpp"), `${relativePath} is missing the CEEMDAN_cpp spelling`);
  assert(rowForArchive(rows, "PAL4_EnglishMod")?.includes("https://github.com/DodgeHo/PAL4_EnglishMod"), `${relativePath} is missing the PAL4 repository link`);
  assert(rowForArchive(rows, "TapPhysics")?.includes('href="/tapphysics/"'), `${relativePath} is missing the TapPhysics /tapphysics/ route`);
  assert(rowForArchive(rows, "PuzzleWear")?.includes(`href="${puzzleWearUrl}"`), `${relativePath} is missing the exact PuzzleWear login URL`);
  assert(!rowForArchive(rows, "PuzzleWear")?.includes('href="https://puzzlewear.cn/"'), `${relativePath} still points PuzzleWear at the root URL`);
  assert(rowForArchive(rows, "DevEnglish")?.includes('href="https://devenglish.club/"'), `${relativePath} is missing the DevEnglish live URL`);
  assert(!rowForArchive(rows, "CWC")?.includes("github.com"), `${relativePath} must not expose a CWC GitHub link`);

  for (const repository of repositories.filter((candidate) => candidate.origin === "fork")) {
    const row = rows.find((candidate) => rowName(candidate) === repository.name);
    assert(row?.includes('data-origin="fork"'), `${relativePath} is missing the fork data marker for ${repository.name}`);
    assert(/Fork(?: \/ (?:contribution|貢獻|贡献))?/.test(row ?? ""), `${relativePath} is missing a visible fork label for ${repository.name}`);
  }

  assert(artifact.includes("data-project-search"), `${relativePath} is missing project search`);
  for (const project of projects) {
    const auxiliaryName = localizedAuxiliaryName(project, locale);
    if (!auxiliaryName) continue;
    assert(rowForArchive(rows, project.name)?.includes(auxiliaryName), `${relativePath} is missing auxiliary name for ${project.name}: ${auxiliaryName}`);
  }
  assertExcludesAll(rowForArchive(rows, "HeatStack") ?? "", staleHeatStackCopy, `${relativePath} HeatStack row`);
  assertExcludesAll(rowForArchive(rows, "TapPhysics") ?? "", staleTapPhysicsCopy, `${relativePath} TapPhysics row`);
  assert(artifact.includes('data-project-filter="featured"'), `${relativePath} is missing featured filtering`);
  assert(artifact.includes('data-project-filter="private"'), `${relativePath} is missing private filtering`);
  assert(artifact.includes('data-project-filter="fork"'), `${relativePath} is missing fork filtering`);
  assert(artifact.includes("data-project-sort"), `${relativePath} is missing project sorting`);
  verifyPageMetadata(artifact, `${locale} archive`);
}

function rowForArchive(rows, name) {
  return rows.find((candidate) => rowName(candidate) === name);
}

async function verifyHirePage(root, relativePath, locale) {
  const artifact = await read(root, relativePath);
  const expectedLang = { en: "en", "zh-Hant": "zh-Hant", "zh-Hans": "zh-Hans", ja: "ja" }[locale];
  assert(artifact.includes(`<html lang="${expectedLang}">`), `${relativePath} has the wrong document language`);
  assert(artifact.includes('class="hire-skip"') && artifact.includes('href="#main"'), `${relativePath} is missing its skip link`);
  assert(artifact.includes('id="approach"') && artifact.includes('id="evidence"') && artifact.includes('id="evidence-index"') && artifact.includes('id="review"') && artifact.includes('id="boundaries"') && artifact.includes('id="contact"'), `${relativePath} is missing the recruiter reading path`);
  const expectedName = { en: "Dodge Ho / Lang He", "zh-Hant": "Dodge Ho / 道安瀾", "zh-Hans": "Dodge Ho / 道安澜", ja: "道安瀾（ドッジ・ホー）" }[locale];
  assert(artifact.includes(`<h1 id="hire-title">${expectedName}</h1>`), `${relativePath} is missing the localized profile name`);
  assert(artifact.includes('class="evidence-table"') && artifact.includes('class="review-list"') && artifact.includes('class="boundary-list"'), `${relativePath} is missing its semantic evidence structures`);
  assert(!artifact.includes("hire-mark") && !artifact.includes("reading-path") && !artifact.includes("target-panel"), `${relativePath} still contains the discarded dashboard composition`);
  for (const fact of ["Hono API", "PostgreSQL", "Redis", "BullMQ", "OpenAPI", "VMD_cpp", "PAL4_EnglishMod", "IELTS_writing_GPT", "Dynamic RRT Connect", "mock-compatible", "AWS", "RPO/RTO"]) {
    assert(artifact.includes(fact), `${relativePath} is missing required evidence or boundary: ${fact}`);
  }
  for (const href of ["/demo/", "/demo/frontend/", "/demo/docs", "/demo/openapi.json", "https://github.com/DodgeHo", "https://www.linkedin.com/in/lang-he-a94655120/"]) {
    assert(artifact.includes(`href="${href}"`), `${relativePath} is missing review link ${href}`);
  }
  assert(!artifact.includes("<form"), `${relativePath} must not publish a hiring form`);
  assert(!artifact.includes("mailto:"), `${relativePath} must not publish an unconfirmed email address`);
  assert(artifact.includes('"@type":"ProfilePage"') && !artifact.includes('"jobTitle"'), `${relativePath} has unsafe or incomplete profile JSON-LD`);
  verifyPageMetadata(artifact, `${locale} hire page`);
}

async function verifyGeneratedPages(root) {
  const home = await read(root, "index.html");
  assert(home.includes("ANLAN.STORE") && home.includes('id="signal-lattice"'), "Homepage lost composition C identity");
  assert(home.includes("https://www.linkedin.com/in/lang-he-a94655120/") && home.includes("My LinkedIn profile"), "Homepage lost the labeled LinkedIn profile control");
  assert(home.includes("https://github.com/DodgeHo") && home.includes("github-link"), "Homepage lost the GitHub profile control");
  assert(home.includes('href="/projects/"'), "Homepage does not link to the complete archive");
  const homeIndexes = homeOrder.map((name) => home.indexOf(`"name":"${name}"`));
  homeIndexes.forEach((index, position) => assert(index >= 0, `Homepage project data is missing ${homeOrder[position]}`));
  assert(homeIndexes.every((index, position) => position === 0 || homeIndexes[position - 1] < index), "Homepage project order does not match the required sequence");
  assert(countOccurrences(home, '"name":"VMD"') === 1, "Homepage must contain one VMD project-family record");
  for (const url of vmdHomeUrls) assert(countOccurrences(home, url) === 1, `Homepage must contain the VMD family URL exactly once: ${url}`);
  assert(!home.includes("VMD_2D_CPP_OpenCV"), "Homepage must not include VMD_2D_CPP_OpenCV");
  assert(home.indexOf('"homepageActions"') < home.indexOf('"name":"IELTS writing GPT"'), "Homepage action data is unexpectedly reordered before PAL4 checks");
  assert(home.includes("https://dodgeho.github.io/PAL4_EnglishMod/") && home.indexOf("https://dodgeho.github.io/PAL4_EnglishMod/") < home.indexOf("https://github.com/DodgeHo/PAL4_EnglishMod"), "PAL4 homepage action must appear before the repository action");
  assert(home.includes('"route":"/tapphysics/"') && home.includes('"action":"/tapphysics/"'), "Homepage TapPhysics action must point to /tapphysics/");
  assert(home.includes(`"action":"${puzzleWearUrl}"`), "Homepage is missing the exact PuzzleWear login URL");
  assert(!home.includes('href="https://puzzlewear.cn/"'), "Homepage still points PuzzleWear at the root URL");
  assert(home.includes("https://devenglish.club/"), "Homepage is missing DevEnglish live URL");
  assertIncludesAll(home, requiredAuxiliaryNames, "Homepage project data");
  assertExcludesAll(homeProjectBlock(home, "HeatStack"), staleHeatStackCopy, "Homepage HeatStack project data");
  assertExcludesAll(homeProjectBlock(home, "TapPhysics"), staleTapPhysicsCopy, "Homepage TapPhysics project data");
  for (const name of ["CWC", "PuzzleWear", "DevEnglish", "ISPM Practice"]) {
    const nameIndex = home.indexOf(`"name":"${name}"`);
    const nextIndex = homeOrder.map((candidate) => home.indexOf(`"name":"${candidate}"`)).filter((index) => index > nameIndex).sort((a, b) => a - b)[0] ?? home.length;
    const block = home.slice(nameIndex, nextIndex);
    assert(block.includes('"closedSource":true'), `Homepage is missing closed-source status for ${name}`);
  }
  assert(!home.includes('href="/ispm/"') && !home.includes('route:"/ispm/"'), "Homepage must not expose an ISPM route");
  assert(!home.includes("Ten project signals"), "Homepage still contains the old Ten project signals copy");
  for (const hash of ["#en", "#zh", "#zh-hans", "#zh-hant", "#ja"]) {
    assert(home.toLowerCase().includes(`'${hash}'`) || home.toLowerCase().includes(`"${hash}"`), `Homepage is missing language hash ${hash}`);
  }
  assert(home.includes('<script type="application/ld+json">'), "Homepage is missing JSON-LD");
  assert(!/__[A-Z0-9_]+__/.test(home), "Homepage contains an unresolved build placeholder");

  const upwork = await read(root, "upwork/index.html");
  verifyUpworkMetadata(upwork, "Upwork entry page");
  assert(upwork.includes('data-upwork-page'), "Upwork entry page is missing its page root");
  for (const portfolio of upworkPortfolio) assert(upwork.includes(portfolio.title), `Upwork entry page is missing ${portfolio.title}`);
  assert(upwork.includes("representative browser-only simulation"), "Upwork entry page is missing its simulation boundary");
  for (const portfolio of upworkPortfolio) {
    const artifact = await read(root, `upwork/${portfolio.slug}/index.html`);
    verifyUpworkMetadata(artifact, `Upwork ${portfolio.slug} case page`);
    assert(artifact.includes(portfolio.title), `Upwork ${portfolio.slug} page is missing its title`);
    assert(artifact.includes(`data-demo="${portfolio.demoType}"`), `Upwork ${portfolio.slug} page is missing its demo marker`);
    assert(artifact.includes(portfolio.demoLabel), `Upwork ${portfolio.slug} page is missing its demo label`);
    assert(artifact.includes("Problem") && artifact.includes("Approach") && artifact.includes("Proof") && artifact.includes("Limits") && artifact.includes("Delivery signals"), `Upwork ${portfolio.slug} page is missing case sections`);
    if (portfolio.demoType === "reliability") assert(artifact.includes("Simulation only"), "Reliability page is missing its simulation boundary");
    else assert(artifact.includes("Representative"), `${portfolio.slug} page is missing its representative-demo boundary`);
  }

  for (const locale of localeList) {
    const prefix = localePrefixes[locale];
    await verifyHirePage(root, `${prefix}hire/index.html`, locale);
    await verifyArchive(root, `${prefix}projects/index.html`, locale);
    const archive = await read(root, `${prefix}projects/index.html`);
    if (locale === "zh-Hans") assert(archive.includes("粤ICP备2026035259号-1"), "Simplified Chinese archive is missing ICP text");
    else assert(!archive.includes("粤ICP备2026035259号-1"), `${locale} archive must not contain Simplified Chinese ICP text`);
    for (const slug of flagshipSlugs) {
      const detail = await read(root, `${prefix}projects/${slug}/index.html`);
      verifyPageMetadata(detail, `${locale} ${slug} case study`);
      const auxiliaryName = localizedAuxiliaryName(bySlug.get(slug) ?? {}, locale);
      if (auxiliaryName) assert(detail.includes(auxiliaryName), `${locale} ${slug} detail is missing auxiliary name ${auxiliaryName}`);
      if (slug === "heatstack") assertExcludesAll(detail, staleHeatStackCopy, `${locale} HeatStack detail`);
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
  for (const path of ["/hire/", "/zh-hant/hire/", "/zh-hans/hire/", "/ja/hire/"]) assert(sitemap.includes(`https://anlan.store${path}`), `Sitemap is missing ${path}`);
  assert(sitemap.includes("https://anlan.store/upwork/"), "Sitemap is missing the Upwork entry page");
  for (const portfolio of upworkPortfolio) assert(sitemap.includes(`https://anlan.store/upwork/${portfolio.slug}/`), `Sitemap is missing Upwork ${portfolio.slug}`);
  assert(!repositories.filter((repository) => repository.visibility === "private").some((repository) => sitemap.includes(`/projects/${repository.slug}/`)), "Sitemap includes an unpublished private project page");
  assert(robots.includes("Sitemap: https://anlan.store/sitemap.xml"), "robots.txt is missing the sitemap URL");
  assert(feed.includes("ANLAN.STORE Project Updates") && flagshipSlugs.every((slug) => feed.includes(`/projects/${slug}/`)), "RSS feed is missing flagship project updates");
}

async function verifyNoPrivateLeaks(root) {
  const privateRepositories = repositories.filter((repository) => repository.visibility === "private");
  for (const path of await listFiles(root)) {
    const artifact = await readFile(path, "utf8");
    assert(!artifact.includes("api.github.com"), `${path} contains a GitHub API address`);
    assert(!artifact.includes("Ten project signals"), `${path} contains stale homepage copy`);
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
