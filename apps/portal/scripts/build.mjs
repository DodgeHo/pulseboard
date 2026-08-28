import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assetTitles, localeConfig, siteCopy } from "../content/site-copy.mjs";
import { loadCatalog, localeList } from "./lib/catalog.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "../..");
const sourceRoot = resolve(packageRoot, "src");
const localRoot = resolve(packageRoot, "dist");
const deployRoot = resolve(repositoryRoot, "deploy/anlan");
const siteUrl = "https://anlan.store";

const normalizeNewlines = (value) => value.replace(/\r\n?/g, "\n");
const readText = async (path) => normalizeNewlines(await readFile(path, "utf8"));
const readDataUri = async (path, mimeType) => {
  const bytes = await readFile(path);
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
};
const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
const escapeJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
const localePath = (locale, suffix) => `${localeConfig[locale].prefix}${suffix}` || "/";
const absoluteUrl = (path) => `${siteUrl}${path}`;

const [template, portalCssRaw, portalJsRaw, archiveCssRaw, archiveJs, operationsImage, customerImage, interRegular, interSemibold] = await Promise.all([
  readText(resolve(sourceRoot, "index.html")),
  readText(resolve(sourceRoot, "styles.css")),
  readText(resolve(sourceRoot, "main.js")),
  readText(resolve(sourceRoot, "archive.css")),
  readText(resolve(sourceRoot, "archive.js")),
  readDataUri(resolve(sourceRoot, "assets/pulseboard-ops.png"), "image/png"),
  readDataUri(resolve(sourceRoot, "assets/pulseboard-customer.png"), "image/png"),
  readDataUri(resolve(sourceRoot, "assets/fonts/Inter-400.woff"), "font/woff"),
  readDataUri(resolve(sourceRoot, "assets/fonts/Inter-600.woff"), "font/woff")
]);

const { snapshot, projects, repositories, caseStudies } = await loadCatalog(packageRoot);
if (
  snapshot.repositories.length !== snapshot.counts.total
  || snapshot.counts.public + snapshot.counts.private !== snapshot.counts.total
  || snapshot.counts.forks + snapshot.counts.original !== snapshot.counts.total
) {
  throw new Error(`Inventory facts are internally inconsistent: ${JSON.stringify(snapshot.counts)}`);
}

const privateNames = repositories.filter((project) => project.visibility === "private").map((project) => project.name);
const bySlug = new Map(projects.map((project) => [project.slug, project]));
const byName = new Map(projects.map((project) => [project.name, project]));

const genericPrivateSummary = {
  en: "A private study route retained without a public application link.",
  "zh-Hant": "保留但不提供公開應用入口的私人學習路線。",
  "zh-Hans": "保留但不提供公开应用入口的私有学习路线。",
  ja: "公開アプリへのリンクを持たずに記録した非公開の学習ルートです。"
};

const homeDefinitions = [
  { lookup: "HeatStack", id: "heatstack", category: "live", layout: "feature", color: "orange", name: "HeatStack", alias: "AI 热栈", route: "/heatstack/", action: "/heatstack/", actionKey: "open" },
  { lookup: "pulseboard", id: "pulseboard", category: "live", layout: "feature", color: "cyan", name: "PulseBoard", route: "/demo/", action: "/demo/", actionKey: "open" },
  { lookup: "Career Radar", id: "career", category: "live", layout: "major", color: "orange", name: "Career Radar", alias: "职海雷达 · キャリアレーダー", route: "/jobs/", action: "/jobs/", actionKey: "open" },
  { lookup: "aws-saa-learning-skill", id: "saa", category: "study", layout: "study", color: "cobalt", name: "SAA Practice", route: "/saa/", action: "/saa/", actionKey: "open" },
  { lookup: "SAP Practice", id: "sap", category: "study", layout: "study-small", color: "violet", name: "SAP Practice", route: "/sap/", action: "/sap/", actionKey: "open" },
  { id: "ispm", category: "study", layout: "quiet", color: "orange", name: "ISPM Practice", railLinked: false, railKeywords: ["ITSM", "study", "unlinked"], tags: ["ITSM", "practice", "progress"], safeSummary: genericPrivateSummary, evidence: ["Unlinked study route"] },
  { lookup: "VMD_cpp", id: "vmd", category: "source", layout: "research", color: "violet", name: "VMD_cpp" },
  { lookup: "PAL4_EnglishMod", id: "pal4", category: "source", layout: "source", color: "orange", name: "PAL4 translation", alias: "PAL4_EnglishMod" },
  { lookup: "IELTS_writing_GPT", id: "ielts", category: "source", layout: "source-compact", color: "cobalt", name: "IELTS writing GPT", alias: "IELTS_writing_GPT" },
  { lookup: "dynamic_rrt_connect", id: "rrt", category: "source", layout: "source-wide", color: "cyan", name: "Dynamic RRT Connect", alias: "dynamic_rrt_connect" }
];

const homeProjects = homeDefinitions.map((definition) => {
  const project = definition.lookup ? byName.get(definition.lookup) : null;
  if (definition.lookup && !project) throw new Error(`Missing home project: ${definition.lookup}`);
  const sourceAction = definition.category === "source" ? project.githubUrl : definition.action;
  return {
    ...definition,
    route: definition.route || project?.githubUrl,
    action: sourceAction,
    actionKey: definition.actionKey || "external",
    railKeywords: definition.railKeywords || project.skills.slice(0, 3),
    tags: definition.tags || project.skills,
    safeSummary: definition.safeSummary || project.safeSummary,
    evidence: definition.evidence || project.evidence,
    casePath: project?.publishCaseStudy ? `/projects/${project.slug}/` : null
  };
});

const portalCss = portalCssRaw
  .replace("__INTER_REGULAR_FONT__", interRegular)
  .replace("__INTER_SEMIBOLD_FONT__", interSemibold);
const portalJs = portalJsRaw
  .replace("__FEATURED_PROJECTS_JSON__", escapeJson(homeProjects))
  .replace("__PULSEBOARD_OPS_IMAGE__", operationsImage)
  .replace("__PULSEBOARD_CUSTOMER_IMAGE__", customerImage);
const archiveCss = archiveCssRaw
  .replace("__INTER_REGULAR_FONT__", interRegular)
  .replace("__INTER_SEMIBOLD_FONT__", interSemibold);

let homeArtifact = template
  .replace("__PORTAL_CSS__", portalCss)
  .replace("__PORTAL_JS__", portalJs);

const ensureResolved = (artifact, label) => {
  const placeholder = artifact.match(/__[A-Z0-9_]+__/);
  if (placeholder) throw new Error(`${label} contains unresolved placeholder ${placeholder[0]}`);
};
ensureResolved(homeArtifact, "home page");

const outputPaths = [];
const writeOutput = async (relativePath, content) => {
  for (const root of [localRoot, deployRoot]) {
    const target = resolve(root, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
    outputPaths.push(target);
  }
};

const hreflangLinks = (suffix) => localeList.map((locale) =>
  `<link rel="alternate" hreflang="${locale}" href="${absoluteUrl(localePath(locale, suffix))}">`
).join("") + `<link rel="alternate" hreflang="x-default" href="${absoluteUrl(localePath("en", suffix))}">`;

const languageHashRedirect = (suffix) => `<script>(()=>{const m={'#en':'en','#zh':'zh-Hans','#zh-hans':'zh-Hans','#zh-hant':'zh-Hant','#ja':'ja'};const p={en:'', 'zh-Hans':'/zh-hans','zh-Hant':'/zh-hant',ja:'/ja'};const l=m[location.hash.toLowerCase()];if(l){const n=p[l]+'${suffix}';if(location.pathname!==n)location.replace(n);}})();</script>`;
const homeLocaleHref = (locale) => ({ en: "/#en", "zh-Hans": "/#zh-hans", "zh-Hant": "/#zh-hant", ja: "/#ja" })[locale];

const topbar = (locale, suffix) => {
  const copy = siteCopy[locale];
  return `<header class="archive-topbar">
    <a class="archive-brand" href="${homeLocaleHref(locale)}" aria-label="${escapeHtml(copy.home)}"><span class="archive-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>ANLAN.STORE</span></a>
    <p class="archive-context">${escapeHtml(copy.context)}</p>
    <div class="archive-actions">
      <a class="archive-profile" href="https://www.linkedin.com/in/lang-he-a94655120/" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.4A1.8 1.8 0 1 1 5.2 7a1.8 1.8 0 0 1 0-3.6ZM3.7 8.4h3V20h-3V8.4Zm4.9 0h2.9V10c.4-.8 1.5-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6V20h-3v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20h-3V8.4Z" fill="currentColor"/></svg><span>${escapeHtml(copy.profile)}</span></a>
      <nav class="locale-links" aria-label="Language">${localeList.map((candidate) => `<a href="${localePath(candidate, suffix)}"${candidate === locale ? ' aria-current="page"' : ""}>${localeConfig[candidate].short}</a>`).join("")}</nav>
    </div>
  </header>`;
};

const basePage = ({ locale, suffix, title, description, body, type = "website", script = "", jsonLd = null }) => {
  const canonical = absoluteUrl(localePath(locale, suffix));
  return `<!doctype html><html lang="${localeConfig[locale].htmlLang}"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}"><meta name="theme-color" content="#060817">
    <title>${escapeHtml(title)} · ANLAN.STORE</title><link rel="canonical" href="${canonical}">${hreflangLinks(suffix)}
    <meta property="og:type" content="${type}"><meta property="og:title" content="${escapeHtml(title)} · ANLAN.STORE"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}">
    <style>${archiveCss}</style>${jsonLd ? `<script type="application/ld+json">${escapeJson(jsonLd)}</script>` : ""}
  </head><body><a class="archive-skip" href="#main">${escapeHtml(siteCopy[locale].skip)}</a><div class="archive-shell">${topbar(locale, suffix)}${body}<footer class="archive-footer"><span>${escapeHtml(siteCopy[locale].footer)}</span><a href="${localePath(locale, "/projects/")}">${escapeHtml(siteCopy[locale].backArchive)}</a></footer></div>${languageHashRedirect(suffix)}${script ? `<script>${script}</script>` : ""}</body></html>`;
};

const icons = {
  external: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 6.5 9.5M12 9.5V13H3V4h3.5" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>`,
  lock: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 7V5.4a3.5 3.5 0 0 1 7 0V7M3 7h10v7H3V7Z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`
};

const projectDetailSuffix = (project) => `/projects/${project.slug}/`;

const archiveRow = (project, locale, index) => {
  const copy = siteCopy[locale];
  const isPrivate = project.visibility === "private";
  const detailAvailable = !isPrivate || project.publishCaseStudy;
  const searchable = [project.name, project.safeSummary[locale], ...project.skills].join(" ").toLocaleLowerCase();
  const actions = [
    ...project.liveRoutes.map((route) => `<a class="row-action" href="${route}">${escapeHtml(copy.live)}</a>`),
    detailAvailable ? `<a class="row-action" href="${localePath(locale, projectDetailSuffix(project))}">${escapeHtml(project.publishCaseStudy ? copy.caseStudy : copy.details)}</a>` : "",
    project.githubUrl ? `<a class="row-action" href="${project.githubUrl}" target="_blank" rel="noreferrer">${escapeHtml(copy.github)}${icons.external}</a>` : "",
    isPrivate ? `<span class="locked-state">${icons.lock}${escapeHtml(copy.locked)}</span>` : ""
  ].filter(Boolean).join("");
  return `<article class="archive-row" data-project-row data-category="${project.category}" data-origin="${project.origin}" data-visibility="${project.visibility}" data-featured="${project.featured}" data-score="${project.score}" data-updated="${project.updatedAt || ""}" data-name="${escapeHtml(project.name)}" data-search="${escapeHtml(searchable)}">
    <span class="row-index" data-row-index>${String(index + 1).padStart(2, "0")}</span>
    <div class="row-name"><h3>${escapeHtml(project.name)}</h3><div class="row-flags"><span class="row-flag">${escapeHtml(isPrivate ? copy.private : copy.public)}</span><span class="row-flag is-origin">${escapeHtml(project.origin === "fork" ? copy.fork : copy.original)}</span>${project.featured ? `<span class="row-flag">${escapeHtml(copy.filters.featured)}</span>` : ""}</div></div>
    <div class="row-copy"><p>${escapeHtml(project.safeSummary[locale])}</p><ul class="row-skills">${project.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}</ul></div>
    <p class="row-evidence"><strong>${escapeHtml(copy.evidence)}</strong>${project.evidence.map(escapeHtml).join("<br>")}</p>
    <div class="row-actions">${actions}</div>
  </article>`;
};

const archivePage = (locale) => {
  const copy = siteCopy[locale];
  const suffix = "/projects/";
  const body = `<main id="main">
    <section class="archive-hero"><div class="archive-intro"><h1>${escapeHtml(copy.archiveTitle)}</h1><p>${escapeHtml(copy.archiveDescription)}</p></div><dl class="archive-stats"><div><dt>${escapeHtml(copy.total)}</dt><dd>${snapshot.counts.total}</dd></div><div><dt>${escapeHtml(copy.publicCount)}</dt><dd>${snapshot.counts.public}</dd></div><div><dt>${escapeHtml(copy.privateCount)}</dt><dd>${snapshot.counts.private}</dd></div></dl></section>
    <section class="archive-controls" aria-label="${escapeHtml(copy.inventory)}"><label class="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="1.7"/></svg><input type="search" data-project-search placeholder="${escapeHtml(copy.search)}" aria-label="${escapeHtml(copy.search)}"></label><div class="archive-filters">${Object.entries(copy.filters).map(([key, label], index) => `<button type="button" data-project-filter="${key}" aria-pressed="${index === 0}">${escapeHtml(label)}</button>`).join("")}</div><select class="archive-sort" data-project-sort aria-label="${escapeHtml(copy.sort)}"><option value="value">${escapeHtml(copy.sortValue)}</option><option value="updated">${escapeHtml(copy.sortUpdated)}</option><option value="name">${escapeHtml(copy.sortName)}</option></select></section>
    <section class="inventory"><header class="inventory-head"><div><h2>${escapeHtml(copy.inventory)}</h2><p>${escapeHtml(copy.inventoryIntro)}</p></div><span class="result-count" data-result-count data-template="${escapeHtml(copy.resultCount)}">${escapeHtml(copy.resultCount.replace("{count}", String(projects.length)))}</span></header><div class="project-table" data-project-table>${projects.map((project, index) => archiveRow(project, locale, index)).join("")}</div><p class="empty-results" data-empty-results hidden>${escapeHtml(copy.empty)}</p></section>
  </main>`;
  const jsonLd = { "@context": "https://schema.org", "@type": "CollectionPage", name: copy.archiveTitle, description: copy.archiveDescription, url: absoluteUrl(localePath(locale, suffix)), author: { "@type": "Person", name: "Dodge Ho", sameAs: "https://www.linkedin.com/in/lang-he-a94655120/" } };
  return basePage({ locale, suffix, title: copy.archiveTitle, description: copy.archiveDescription, body, script: archiveJs, jsonLd });
};

const sectionOrder = ["problem", "role", "constraints", "decisions", "architecture", "evidence", "result", "limits"];
const sectionLabel = (copy, key) => key === "evidence" ? copy.evidenceSection : copy[key];

const relatedProjects = (project) => projects.filter((candidate) => candidate.slug !== project.slug && candidate.category === project.category && candidate.visibility === "public").slice(0, 4);

const detailPage = (project, locale) => {
  const copy = siteCopy[locale];
  const suffix = projectDetailSuffix(project);
  const study = caseStudies[project.slug];
  const actionLinks = [
    ...project.liveRoutes.map((route) => `<a href="${route}">${escapeHtml(copy.live)}</a>`),
    project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" rel="noreferrer">${escapeHtml(copy.github)}</a>` : ""
  ].filter(Boolean).join("");
  const mainContent = study
    ? sectionOrder.map((key) => `<section class="case-section"><h2>${escapeHtml(sectionLabel(copy, key))}</h2><p>${escapeHtml(study.sections[key][locale])}</p></section>`).join("")
    : `<section class="case-section"><h2>${escapeHtml(copy.metadata)}</h2><p>${escapeHtml(copy.sourceRecord)}</p></section><section class="case-section"><h2>${escapeHtml(copy.technologies)}</h2><p>${escapeHtml(project.skills.join(" · "))}</p></section><section class="case-section"><h2>${escapeHtml(copy.evidence)}</h2><p>${escapeHtml(project.evidence.join(" · "))}</p></section>`;
  const assets = study?.assets || [];
  const aside = `<aside class="case-aside"><h2>${escapeHtml(copy.metadata)}</h2><dl class="archive-stats"><div><dt>${escapeHtml(copy.status)}</dt><dd>${escapeHtml(project.visibility === "private" ? copy.private : project.origin === "fork" ? copy.fork : copy.original)}</dd></div><div><dt>${escapeHtml(copy.updated)}</dt><dd>${escapeHtml(project.updatedAt?.slice(0, 10) || copy.noDate)}</dd></div></dl>${assets.length ? `<h2>${escapeHtml(copy.assets)}</h2><ul class="asset-nav">${assets.map((asset) => `<li><a href="${localePath(locale, `${suffix}${asset}/`)}">${escapeHtml(assetTitles[asset][locale])}</a></li>`).join("")}</ul>` : ""}<div class="related"><h2>${escapeHtml(copy.related)}</h2>${relatedProjects(project).map((related) => `<a href="${localePath(locale, projectDetailSuffix(related))}">${escapeHtml(related.name)}</a>`).join("")}</div></aside>`;
  const body = `<main id="main"><section class="case-hero"><h1>${escapeHtml(project.name)}</h1><p class="case-summary">${escapeHtml(project.safeSummary[locale])}</p><div class="case-actions">${actionLinks}<a href="${localePath(locale, "/projects/")}">${escapeHtml(copy.backArchive)}</a></div></section><div class="detail-main"><article class="case-content">${mainContent}</article>${aside}</div></main>`;
  const jsonLd = { "@context": "https://schema.org", "@type": study ? "TechArticle" : "CreativeWork", headline: project.name, description: project.safeSummary[locale], dateModified: study?.updatedAt || project.updatedAt || snapshot.syncedAt, url: absoluteUrl(localePath(locale, suffix)), author: { "@type": "Person", name: "Dodge Ho" } };
  return basePage({ locale, suffix, title: project.name, description: project.safeSummary[locale], body, type: "article", jsonLd });
};

const assetPage = (project, asset, locale) => {
  const copy = siteCopy[locale];
  const suffix = `${projectDetailSuffix(project)}${asset}/`;
  const title = `${project.name} · ${assetTitles[asset][locale]}`;
  const architectureText = caseStudies[project.slug].sections.architecture[locale];
  const evidenceText = caseStudies[project.slug].sections.evidence[locale];
  const body = `<main id="main"><section class="case-hero"><h1>${escapeHtml(assetTitles[asset][locale])}</h1><p class="case-summary">${escapeHtml(project.name)} · ${escapeHtml(copy.assetNote)}</p><div class="case-actions"><a href="${localePath(locale, projectDetailSuffix(project))}">${escapeHtml(copy.caseStudy)}</a><a href="${localePath(locale, "/projects/")}">${escapeHtml(copy.backArchive)}</a></div></section><div class="detail-main"><article class="case-content"><section class="case-section"><h2>${escapeHtml(copy.architecture)}</h2><p>${escapeHtml(architectureText)}</p></section><section class="case-section"><h2>${escapeHtml(copy.evidenceSection)}</h2><p>${escapeHtml(evidenceText)}</p></section><section class="case-section"><h2>${escapeHtml(copy.constraints)}</h2><p>${escapeHtml(copy.assetNote)}</p></section></article><aside class="case-aside"><h2>${escapeHtml(copy.assets)}</h2><ul class="asset-nav">${caseStudies[project.slug].assets.map((candidate) => `<li><a href="${localePath(locale, `${projectDetailSuffix(project)}${candidate}/`)}">${escapeHtml(assetTitles[candidate][locale])}</a></li>`).join("")}</ul></aside></div></main>`;
  const jsonLd = { "@context": "https://schema.org", "@type": "TechArticle", headline: title, description: copy.assetNote, dateModified: caseStudies[project.slug].updatedAt, url: absoluteUrl(localePath(locale, suffix)), isPartOf: absoluteUrl(localePath(locale, projectDetailSuffix(project))), author: { "@type": "Person", name: "Dodge Ho" } };
  return basePage({ locale, suffix, title, description: copy.assetNote, body, type: "article", jsonLd });
};

await rm(localRoot, { recursive: true, force: true });
await writeOutput("index.html", homeArtifact);

const sitemapPaths = ["/"];
for (const locale of localeList) {
  const archiveSuffix = "/projects/";
  await writeOutput(`${localePath(locale, archiveSuffix).replace(/^\//, "")}index.html`, archivePage(locale));
  sitemapPaths.push(localePath(locale, archiveSuffix));
  for (const project of projects) {
    if (project.visibility === "private" && !project.publishCaseStudy) continue;
    const detailSuffix = projectDetailSuffix(project);
    await writeOutput(`${localePath(locale, detailSuffix).replace(/^\//, "")}index.html`, detailPage(project, locale));
    sitemapPaths.push(localePath(locale, detailSuffix));
    const study = caseStudies[project.slug];
    if (!study) continue;
    for (const asset of study.assets) {
      const assetSuffix = `${detailSuffix}${asset}/`;
      await writeOutput(`${localePath(locale, assetSuffix).replace(/^\//, "")}index.html`, assetPage(project, asset, locale));
      sitemapPaths.push(localePath(locale, assetSuffix));
    }
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(sitemapPaths)].map((path) => `  <url><loc>${escapeHtml(absoluteUrl(path))}</loc><lastmod>2026-08-17</lastmod></url>`).join("\n")}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
const feedItems = [bySlug.get("heatstack"), bySlug.get("pulseboard"), bySlug.get("career-radar")].filter(Boolean).map((project) => `<item><title>${escapeHtml(project.name)}</title><link>${escapeHtml(absoluteUrl(projectDetailSuffix(project)))}</link><guid>${escapeHtml(absoluteUrl(projectDetailSuffix(project)))}</guid><pubDate>Mon, 17 Aug 2026 00:00:00 GMT</pubDate><description>${escapeHtml(project.safeSummary.en)}</description></item>`).join("");
const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>ANLAN.STORE Project Updates</title><link>${siteUrl}/projects/</link><description>Durable engineering evidence and project case studies by Dodge Ho.</description>${feedItems}</channel></rss>\n`;
await writeOutput("sitemap.xml", sitemap);
await writeOutput("robots.txt", robots);
await writeOutput("feed.xml", feed);

for (const privateName of privateNames) {
  const escapedName = privateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const privateUrlPattern = new RegExp(`https?://(?:www\\.)?github\\.com/DodgeHo/${escapedName}(?:[/?#\\s\"']|$)`, "i");
  for (const content of [homeArtifact, sitemap, feed]) {
    if (privateUrlPattern.test(content)) throw new Error(`Generated core artifact leaks private repository URL: ${privateName}`);
  }
}

console.log(`Built ANLAN.STORE: ${snapshot.counts.total} repositories, ${projects.length} archive records, ${sitemapPaths.length} localized URLs.`);
