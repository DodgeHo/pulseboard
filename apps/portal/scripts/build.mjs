import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hireCopy, hireLinks } from "../content/hire-copy.mjs";
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
const readTextOptional = async (path) => {
  try {
    return await readText(path);
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
};
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
const isExternalHref = (href = "") => /^https?:\/\//i.test(href);
const linkAttrs = (href = "") => isExternalHref(href) ? ' target="_blank" rel="noreferrer"' : "";
const four = (en, zhHant, zhHans, ja) => ({ en, "zh-Hant": zhHant, "zh-Hans": zhHans, ja });

const loadOptionalUpworkContent = async () => {
  try {
    return await import("../content/upwork-copy.mjs");
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND" && String(error.message).includes("upwork-copy.mjs")) return null;
    throw error;
  }
};

const [template, hireTemplate, portalCssRaw, portalJsRaw, archiveCssRaw, hireCssRaw, archiveJs, operationsImage, customerImage, interRegular, interSemibold] = await Promise.all([
  readText(resolve(sourceRoot, "index.html")),
  readText(resolve(sourceRoot, "hire.html")),
  readText(resolve(sourceRoot, "styles.css")),
  readText(resolve(sourceRoot, "main.js")),
  readText(resolve(sourceRoot, "archive.css")),
  readText(resolve(sourceRoot, "hire.css")),
  readText(resolve(sourceRoot, "archive.js")),
  readDataUri(resolve(sourceRoot, "assets/pulseboard-ops.png"), "image/png"),
  readDataUri(resolve(sourceRoot, "assets/pulseboard-customer.png"), "image/png"),
  readDataUri(resolve(sourceRoot, "assets/fonts/Inter-400.woff"), "font/woff"),
  readDataUri(resolve(sourceRoot, "assets/fonts/Inter-600.woff"), "font/woff")
]);
const upworkContent = await loadOptionalUpworkContent();
const [upworkCssRaw, upworkJs] = upworkContent ? await Promise.all([
  readTextOptional(resolve(sourceRoot, "upwork/upwork.css")),
  readTextOptional(resolve(sourceRoot, "upwork/upwork.js"))
]) : ["", ""];
const upworkPortfolio = upworkContent?.upworkPortfolio ?? [];
const upworkSite = upworkContent?.upworkSite ?? null;
const upworkEnabled = Boolean(upworkSite && upworkPortfolio.length > 0 && upworkCssRaw && upworkJs);

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
  en: "A closed-source IT service management question-practice tool kept as a study record, with focused review available only through the preserved app route.",
  "zh-Hant": "閉源的 IT 服務管理做題練習工具，作為學習記錄保留，聚焦複習僅透過保留的應用路由呈現。",
  "zh-Hans": "闭源的 IT 服务管理做题练习工具，作为学习记录保留，聚焦复习仅通过保留的应用路由呈现。",
  ja: "クローズドソースの IT サービス管理向け問題練習ツールで、学習記録として保持し、集中レビューは保存済みアプリ経路だけで扱います。"
};

const homeDefinitions = [
  { lookup: "HeatStack", id: "heatstack", category: "live", layout: "feature", color: "orange", name: "HeatStack", route: "/heatstack/", action: "/heatstack/", actionKey: "open" },
  { lookup: "TapPhysics", id: "tapphysics", category: "live", layout: "major", color: "cyan", name: "TapPhysics", route: "/tapphysics/", action: "/tapphysics/", actionKey: "open" },
  { lookup: "Career Radar", id: "career", category: "live", layout: "major", color: "orange", name: "Career Radar", route: "/jobs/", action: "/jobs/", actionKey: "open" },
  { lookup: "PuzzleWear", id: "puzzlewear", category: "live", layout: "study", color: "violet", name: "PuzzleWear", actionKey: "open" },
  { lookup: "CWC", id: "cwc", category: "source", layout: "study-small", color: "orange", name: "CWC" },
  { lookup: "pulseboard", id: "pulseboard", category: "live", layout: "feature", color: "cyan", name: "PulseBoard", route: "/demo/", action: "/demo/", actionKey: "open" },
  { lookup: "aws-saa-learning-skill", id: "saa", category: "study", layout: "study", color: "cobalt", name: "SAA Practice", route: "/saa/", action: "/saa/", actionKey: "open" },
  { lookup: "SAP Practice", id: "sap", category: "study", layout: "study-small", color: "violet", name: "SAP Practice", route: "/sap/", action: "/sap/", actionKey: "open" },
  { id: "ispm", category: "study", layout: "quiet", color: "orange", name: "ISPM Practice", auxiliaryName: four("ISPM Practice - service management question practice", "ISPM Practice-服務管理做題練習", "ISPM Practice-服务管理做题练习", "ISPM Practice - IT サービス管理問題練習"), visibility: "private", privateRepository: false, closedSource: true, railLinked: false, railKeywords: ["ITSM", "question practice", "closed source"], tags: ["ITSM", "question practice", "closed source"], safeSummary: genericPrivateSummary, evidence: ["Unlinked study route"] },
  { lookup: "PAL4_EnglishMod", id: "pal4", category: "source", layout: "source", color: "orange", name: "PAL4 translation", alias: "PAL4_EnglishMod", homepageActions: [{ href: "https://dodgeho.github.io/PAL4_EnglishMod/", key: "homepage" }] },
  { lookup: "IELTS_writing_GPT", id: "ielts", category: "source", layout: "source-compact", color: "cobalt", name: "IELTS writing GPT", alias: "IELTS_writing_GPT" },
  { lookup: "dynamic_rrt_connect", id: "rrt", category: "source", layout: "source-wide", color: "cyan", name: "Dynamic RRT Connect", alias: "dynamic_rrt_connect" },
  { lookup: "VMD_cpp", id: "vmd", category: "source", layout: "research", color: "violet", name: "VMD", family: "vmd", familyMembers: ["VMD_cpp", "VMD_2D_python", "VMD_2D_cpp"], actionKey: "open" },
  { lookup: "CEEMDAN_cpp", id: "ceemdan", category: "source", layout: "research", color: "cobalt", name: "CEEMDAN" },
  { lookup: "DevEnglish", id: "devenglish", category: "live", layout: "source", color: "cyan", name: "DevEnglish", actionKey: "open" }
];

const homeProjects = homeDefinitions.map((definition) => {
  const project = definition.lookup ? byName.get(definition.lookup) : null;
  if (definition.lookup && !project) throw new Error(`Missing home project: ${definition.lookup}`);
  const familyMembers = (definition.familyMembers || []).map((name) => {
    const member = byName.get(name);
    if (!member) throw new Error(`Missing family member: ${name}`);
    return { name: member.name, githubUrl: member.githubUrl, skills: member.skills };
  });
  const sourceAction = familyMembers.length
    ? null
    : definition.category === "source" ? project.githubUrl : definition.action || project?.liveRoutes?.[0] || null;
  return {
    ...definition,
    route: familyMembers.length ? null : definition.route || project?.githubUrl,
    action: sourceAction,
    actionKey: definition.actionKey || "external",
    actionExternal: Boolean(sourceAction && isExternalHref(sourceAction)),
    homepageActions: definition.homepageActions || [],
    railKeywords: definition.railKeywords || project.skills.slice(0, 3),
    tags: definition.tags || project.skills,
    safeSummary: definition.safeSummary || project.safeSummary,
    auxiliaryName: definition.auxiliaryName || project?.auxiliaryName || null,
    evidence: definition.evidence || project.evidence,
    casePath: project?.publishCaseStudy ? `/projects/${project.slug}/` : null,
    visibility: definition.visibility || project?.visibility || "public",
    privateRepository: Boolean(definition.privateRepository ?? project?.privateRepository),
    closedSource: Boolean(definition.closedSource ?? project?.closedSource),
    familyMembers
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
const hireCss = hireCssRaw
  .replace("__INTER_REGULAR_FONT__", interRegular)
  .replace("__INTER_SEMIBOLD_FONT__", interSemibold);
const upworkCss = upworkCssRaw
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
      <a class="archive-profile" href="https://github.com/DodgeHo" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4a9.6 9.6 0 0 0-3 18.7c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.3-2.2-.3-4.6-1.1-4.6-4.8 0-1.1.4-1.9 1-2.6-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.6.7.7 1 1.5 1 2.6 0 3.7-2.3 4.5-4.6 4.8.4.3.8 1 .8 2v2.3c0 .3.2.6.7.5A9.6 9.6 0 0 0 12 2.4Z" fill="currentColor"/></svg><span>GitHub</span></a>
      <nav class="locale-links" aria-label="Language">${localeList.map((candidate) => `<a href="${localePath(candidate, suffix)}"${candidate === locale ? ' aria-current="page"' : ""}>${localeConfig[candidate].short}</a>`).join("")}</nav>
    </div>
  </header>`;
};

const basePage = ({ locale, suffix, title, description, body, type = "website", script = "", jsonLd = null }) => {
  const canonical = absoluteUrl(localePath(locale, suffix));
  const footerIcp = siteCopy[locale].icp ? `<span>${escapeHtml(siteCopy[locale].icp)}</span>` : "";
  return `<!doctype html><html lang="${localeConfig[locale].htmlLang}"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}"><meta name="theme-color" content="#060817">
    <title>${escapeHtml(title)} · ANLAN.STORE</title><link rel="canonical" href="${canonical}">${hreflangLinks(suffix)}
    <meta property="og:type" content="${type}"><meta property="og:title" content="${escapeHtml(title)} · ANLAN.STORE"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}">
    <style>${archiveCss}</style>${jsonLd ? `<script type="application/ld+json">${escapeJson(jsonLd)}</script>` : ""}
  </head><body><a class="archive-skip" href="#main">${escapeHtml(siteCopy[locale].skip)}</a><div class="archive-shell">${topbar(locale, suffix)}${body}<footer class="archive-footer"><span>${escapeHtml(siteCopy[locale].footer)}</span>${footerIcp}<a href="${localePath(locale, "/projects/")}">${escapeHtml(siteCopy[locale].backArchive)}</a></footer></div>${languageHashRedirect(suffix)}${script ? `<script>${script}</script>` : ""}</body></html>`;
};

const hireHref = (locale, key) => {
  if (key === "home") return homeLocaleHref(locale);
  const href = hireLinks[key];
  if (!href) throw new Error(`Unknown hire link: ${key}`);
  return key.endsWith("Record") ? localePath(locale, href) : href;
};

const hireAnchor = (locale, key, label, className = "text-link") => {
  const href = hireHref(locale, key);
  const external = href.startsWith("https://");
  return `<a class="${className}" href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${escapeHtml(label)}</a>`;
};

const hireSectionHead = ([title, description]) => `<header class="section-head"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></header>`;

const hirePage = (locale) => {
  const copy = hireCopy[locale];
  const suffix = "/hire/";
  const canonical = absoluteUrl(localePath(locale, suffix));
  const body = `<a class="hire-skip" href="#main">${escapeHtml(copy.skip)}</a><div class="hire-shell">
    <header class="hire-topbar"><a class="home-link" href="${homeLocaleHref(locale)}">${escapeHtml(copy.backHome)}</a><nav class="locale-links" aria-label="${escapeHtml(copy.languageLabel)}">${localeList.map((candidate) => `<a href="${localePath(candidate, suffix)}"${candidate === locale ? ' aria-current="page"' : ""}>${localeConfig[candidate].short}</a>`).join("")}</nav></header>
    <main id="main">
      <section class="hire-hero" aria-labelledby="hire-title"><div class="identity-column"><h1 id="hire-title">${escapeHtml(copy.name)}</h1><div class="thesis">${copy.thesis.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div></div><aside class="target-directions"><p>${escapeHtml(copy.targetNote)}</p><ul>${copy.targets.map((target) => `<li>${escapeHtml(target)}</li>`).join("")}</ul></aside></section>
      <section class="hire-section approach-section" id="approach">${hireSectionHead(copy.sections.approach)}<div class="approach-copy">${copy.approachParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div></section>
      <section class="hire-section evidence-section" id="evidence">${hireSectionHead(copy.sections.evidence)}<div class="evidence-list">${copy.evidenceItems.map(([name, kind, text, label, key], index) => `<article class="evidence-record${index === 0 ? " evidence-record-primary" : ""}"><header><h3>${escapeHtml(name)}</h3><p>${escapeHtml(kind)}</p></header><div class="evidence-body"><p>${escapeHtml(text)}</p>${hireAnchor(locale, key, label, "record-link")}</div></article>`).join("")}</div><div class="source-index"><p>${escapeHtml(copy.sourceLabel)}</p><div>${copy.sourceLinks.map(([label, key]) => hireAnchor(locale, key, label, "source-link")).join("")}</div></div></section>
      <section class="hire-section index-section" id="evidence-index">${hireSectionHead(copy.sections.index)}<div class="evidence-table-wrap"><table class="evidence-table"><thead><tr>${copy.tableHeaders.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${copy.tableRows.map(([capability, project, evidence, label, key]) => `<tr><td data-label="${escapeHtml(copy.tableHeaders[0])}">${escapeHtml(capability)}</td><td data-label="${escapeHtml(copy.tableHeaders[1])}">${escapeHtml(project)}</td><td data-label="${escapeHtml(copy.tableHeaders[2])}">${escapeHtml(evidence)}</td><td data-label="${escapeHtml(copy.tableHeaders[3])}">${hireAnchor(locale, key, label)}</td></tr>`).join("")}</tbody></table></div></section>
      <section class="hire-section review-section" id="review">${hireSectionHead(copy.sections.review)}<ol class="review-list">${copy.reviewSteps.map(([time, label, description, key]) => `<li><span class="review-time">${escapeHtml(time)}</span><div><h3>${hireAnchor(locale, key, label, "review-link")}</h3><p>${escapeHtml(description)}</p></div></li>`).join("")}</ol></section>
      <section class="hire-section boundary-section" id="boundaries">${hireSectionHead(copy.sections.boundaries)}<ol class="boundary-list">${copy.boundaries.map(([title, text]) => `<li><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></li>`).join("")}</ol></section>
      <section class="hire-section contact-section" id="contact">${hireSectionHead(copy.sections.contact)}<nav class="contact-links" aria-label="${escapeHtml(copy.sections.contact[0])}">${copy.contacts.map(([label, key]) => hireAnchor(locale, key, label, "contact-link")).join("")}</nav></section>
    </main><footer class="hire-footer"><span>${escapeHtml(copy.footer)}</span><span>${escapeHtml(copy.footerNote)}</span></footer></div>`;
  const jsonLd = { "@context": "https://schema.org", "@type": "ProfilePage", name: copy.title, description: copy.description, url: canonical, mainEntity: { "@type": "Person", name: "Dodge Ho", alternateName: ["Lang He", "道安澜", "道安瀾"], sameAs: [hireLinks.linkedin, hireLinks.github] } };
  return hireTemplate
    .replace("__HTML_LANG__", localeConfig[locale].htmlLang)
    .replaceAll("__DESCRIPTION__", escapeHtml(copy.description))
    .replaceAll("__TITLE__", escapeHtml(copy.title))
    .replaceAll("__CANONICAL__", canonical)
    .replace("__HREFLANG__", hreflangLinks(suffix))
    .replace("__JSON_LD__", escapeJson(jsonLd))
    .replace("__HIRE_CSS__", hireCss)
    .replace("__HIRE_BODY__", body)
    .replace("__LANGUAGE_REDIRECT__", languageHashRedirect(suffix));
};

const upworkHeader = (current = "overview") => `<header class="upwork-topbar">
  <a class="upwork-brand" href="/" aria-label="ANLAN.STORE home"><span class="upwork-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>ANLAN.STORE</span></a>
  <nav class="upwork-nav" aria-label="Upwork portfolio navigation">
    <a href="/upwork/"${current === "overview" ? ' aria-current="page"' : ""}>Overview</a>
    ${upworkPortfolio.map((portfolio) => `<a href="/upwork/${portfolio.slug}/"${current === portfolio.slug ? ' aria-current="page"' : ""}>${escapeHtml(portfolio.index)} / ${escapeHtml(portfolio.title.split(" ")[0])}</a>`).join("")}
    <a href="/hire/">Hire page</a>
  </nav>
</header>`;

const upworkBasePage = ({ suffix, title, description, body, jsonLd, current = "overview" }) => {
  const canonical = absoluteUrl(suffix);
  const hrefLang = `<link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="x-default" href="${canonical}">`;
  return `<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}"><meta name="theme-color" content="#060817">
    <title>${escapeHtml(title)} · ANLAN.STORE</title><link rel="canonical" href="${canonical}">${hrefLang}
    <meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(title)} · ANLAN.STORE"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}">
    <style>${upworkCss}</style>${jsonLd ? `<script type="application/ld+json">${escapeJson(jsonLd)}</script>` : ""}
  </head><body><a class="upwork-skip" href="#main">Skip to content</a><div class="upwork-shell">${upworkHeader(current)}${body}<footer class="upwork-footer"><span>UPWORK / SOFTWARE DELIVERY</span><span>Representative demos. Honest boundaries.</span></footer></div><script>${upworkJs}</script></body></html>`;
};

const demoFor = (portfolio) => {
  if (portfolio.demoType === "feature") return `<div class="upwork-demo" data-demo="feature">
    <form class="demo-toolbar" data-feature-form>
      <div class="demo-field grow"><label for="feature-title">Feature name</label><input id="feature-title" name="featureTitle" autocomplete="off" placeholder="e.g. Add release notes" required></div>
      <div class="demo-field"><label for="feature-owner">Owner</label><input id="feature-owner" name="featureOwner" autocomplete="off" placeholder="Name" required></div>
      <div class="demo-field"><label for="feature-priority">Priority</label><select id="feature-priority" name="featurePriority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></div>
      <button class="upwork-button" type="submit">Add to queue</button><p class="demo-error" data-feature-error role="status" aria-live="polite"></p>
    </form>
    <div class="demo-summary"><div class="demo-stat"><span class="demo-caption">Total records</span><strong data-feature-total>0</strong></div><div class="demo-stat"><span class="demo-caption">Planned</span><strong data-feature-planned>0</strong></div><div class="demo-stat"><span class="demo-caption">In review</span><strong data-feature-reviewed>0</strong></div><div class="demo-stat"><span class="demo-caption">Shipped</span><strong data-feature-shipped>0</strong></div></div>
    <div class="demo-filterbar" aria-label="Feature status filters"><button class="demo-filter" type="button" data-feature-filter="all" aria-pressed="true">All</button><button class="demo-filter" type="button" data-feature-filter="planned" aria-pressed="false">Planned</button><button class="demo-filter" type="button" data-feature-filter="in review" aria-pressed="false">In review</button><button class="demo-filter" type="button" data-feature-filter="shipped" aria-pressed="false">Shipped</button></div>
    <div class="demo-list" data-feature-list aria-live="polite"></div>
  </div>`;
  if (portfolio.demoType === "rescue") return `<div class="upwork-demo" data-demo="rescue"><div class="rescue-layout">
    <div class="rescue-list" role="tablist" aria-label="Representative code samples">
      <button class="rescue-choice" type="button" data-rescue-choice aria-pressed="true"><strong>Async state guard</strong><span>Prevent stale results</span></button>
      <button class="rescue-choice" type="button" data-rescue-choice aria-pressed="false"><strong>Input boundary</strong><span>Scope data access</span></button>
      <button class="rescue-choice" type="button" data-rescue-choice aria-pressed="false"><strong>Validation path</strong><span>Return useful errors</span></button>
    </div><div class="rescue-panel"><p class="demo-caption">Selected representative sample</p><h3 data-rescue-title>Async state guard</h3><p data-rescue-summary></p><div class="code-window" aria-label="Code sample"><pre><code data-rescue-code></code></pre></div><div class="rescue-checks" data-rescue-checks></div><button class="upwork-button" type="button" data-rescue-toggle>Show repaired code</button><p class="rescue-result" data-rescue-result role="status" aria-live="polite"></p></div>
  </div></div>`;
  return `<div class="upwork-demo" data-demo="reliability"><div class="reliability-body"><div class="reliability-steps">
    <article class="reliability-step" data-reliability-step data-state="idle"><strong>01 / HEALTH GATE</strong><h3>Check liveness</h3><p>Confirm the service boundary responds before changing state.</p></article>
    <article class="reliability-step" data-reliability-step data-state="idle"><strong>02 / QUEUE RETRY</strong><h3>Retry work</h3><p>Make the retry decision visible instead of silently dropping a job.</p></article>
    <article class="reliability-step" data-reliability-step data-state="idle"><strong>03 / RESTORE GATE</strong><h3>Validate restore</h3><p>Check the restored state before treating recovery as complete.</p></article>
    <article class="reliability-step" data-reliability-step data-state="idle"><strong>04 / ROLLBACK CHECK</strong><h3>Verify rollback</h3><p>Confirm the release boundary before reopening the path.</p></article>
  </div><button class="upwork-button" type="button" data-reliability-run>Run simulation</button><p class="reliability-output" data-reliability-output role="status" aria-live="polite">Ready. No external system will be touched.</p></div></div>`;
};

const upworkPage = () => {
  const body = `<main id="main" class="upwork-main" data-upwork-page>
    <section class="upwork-hero"><div class="upwork-hero-copy"><p class="upwork-eyebrow">${escapeHtml(upworkSite.eyebrow)}</p><h1>${escapeHtml(upworkSite.headline)}</h1><p class="upwork-lede">${escapeHtml(upworkSite.intro)}</p><div class="upwork-actions"><a class="upwork-button" href="#portfolio">Review the three work modes</a><a class="upwork-button secondary" href="/hire/">Open the evidence page</a></div></div><aside class="upwork-hero-note"><strong>First review</strong><p>${escapeHtml(upworkSite.note)}</p></aside></section>
    <section class="upwork-proof" aria-label="Portfolio focus">${upworkSite.proof.map(([number, title, text]) => `<article><span class="upwork-proof-number">${escapeHtml(number)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></article>`).join("")}</section>
    <section class="upwork-section" id="portfolio"><div class="upwork-section-head"><div><p class="upwork-label">Portfolio / three reviewable slices</p><h2>What I can help make clearer</h2></div><p class="upwork-section-intro">Each piece stays narrow on purpose: a useful behavior, a visible decision path, and a boundary around what the demo can prove.</p></div><div class="upwork-work-grid">${upworkPortfolio.map((portfolio) => `<article class="upwork-card"><span class="upwork-card-index">${escapeHtml(portfolio.index)} / ${escapeHtml(portfolio.demoLabel)}</span><h3>${escapeHtml(portfolio.title)}</h3><p>${escapeHtml(portfolio.short)}</p><ul class="upwork-tags">${portfolio.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul><a class="upwork-card-link" href="/upwork/${portfolio.slug}/">Open case study + demo →</a></article>`).join("")}</div></section>
    <section class="upwork-section upwork-method"><div><p class="upwork-label">Working pattern</p><h2>${escapeHtml(upworkSite.methodTitle)}</h2></div><div class="upwork-method-grid">${upworkSite.method.map(([title, text], index) => `<article class="upwork-method-step"><h3>${String(index + 1).padStart(2, "0")} / ${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}</div></section>
    <section class="upwork-section upwork-boundary"><h2>${escapeHtml(upworkSite.boundaryTitle)}</h2><p>${escapeHtml(upworkSite.boundary)}</p></section>
    <section class="upwork-section upwork-contact"><div class="upwork-contact-copy"><p class="upwork-label">Next conversation</p><h2>${escapeHtml(upworkSite.contactTitle)}</h2><p>${escapeHtml(upworkSite.contactText)}</p></div><a class="upwork-button" href="/hire/">Review working boundaries</a></section>
  </main>`;
  const jsonLd = { "@context": "https://schema.org", "@type": "CollectionPage", name: upworkSite.title, description: upworkSite.description, url: absoluteUrl("/upwork/"), author: { "@type": "Person", name: "Dodge Ho" } };
  return upworkBasePage({ suffix: "/upwork/", title: upworkSite.title, description: upworkSite.description, body, jsonLd });
};

const upworkCasePage = (portfolio) => {
  const title = portfolio.title;
  const description = `${portfolio.title}: ${portfolio.short}`;
  const body = `<main id="main" class="upwork-main" data-upwork-page>
    <section class="upwork-case-hero"><a class="upwork-back" href="/upwork/">← Back to Upwork portfolio</a><p class="upwork-eyebrow">${escapeHtml(portfolio.index)} / ${escapeHtml(portfolio.demoLabel)}</p><h1>${escapeHtml(title)}</h1><p class="upwork-case-intro">${escapeHtml(portfolio.short)}</p><span class="upwork-status">${escapeHtml(portfolio.demoNote)}</span></section>
    <section class="upwork-case-layout"><article class="upwork-case-copy"><section><h2>Problem</h2><p>${escapeHtml(portfolio.problem)}</p></section><section><h2>Approach</h2><p>${escapeHtml(portfolio.approach)}</p></section><section><h2>Proof</h2><p>${escapeHtml(portfolio.proof)}</p></section><section><h2>Limits</h2><p>${escapeHtml(portfolio.limits)}</p></section></article><aside class="upwork-case-meta"><h2>Delivery signals</h2><ul class="upwork-delivery-list">${portfolio.delivery.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><h2>Tools and boundaries</h2><ul class="upwork-tags">${portfolio.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul></aside></section>
    <section class="upwork-demo-section"><div class="upwork-demo-head"><div><p class="upwork-label">Interactive / ${escapeHtml(portfolio.demoLabel)}</p><h2>${escapeHtml(portfolio.demoTitle)}</h2></div><p class="upwork-demo-note">${escapeHtml(portfolio.demoNote)}</p></div>${demoFor(portfolio)}</section>
    <section class="upwork-section upwork-contact"><div class="upwork-contact-copy"><p class="upwork-label">Continue the review</p><h2>Bring the existing codebase, constraint, or failure path.</h2><p>This page demonstrates a bounded working method. The next step would be to inspect the actual repository and agree on the smallest verifiable slice.</p></div><a class="upwork-button" href="/hire/">Open the evidence page</a></section>
  </main>`;
  const jsonLd = { "@context": "https://schema.org", "@type": "TechArticle", headline: title, description, url: absoluteUrl(`/upwork/${portfolio.slug}/`), author: { "@type": "Person", name: "Dodge Ho" } };
  return upworkBasePage({ suffix: `/upwork/${portfolio.slug}/`, title, description, body, jsonLd, current: portfolio.slug });
};

const icons = {
  external: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 6.5 9.5M12 9.5V13H3V4h3.5" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>`,
  lock: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 7V5.4a3.5 3.5 0 0 1 7 0V7M3 7h10v7H3V7Z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`
};

const projectDetailSuffix = (project) => `/projects/${project.slug}/`;
const localizedAuxiliaryName = (project, locale) => project.auxiliaryName?.[locale] || project.auxiliaryName?.en || "";

const archiveRow = (project, locale, index) => {
  const copy = siteCopy[locale];
  const auxiliaryName = localizedAuxiliaryName(project, locale);
  const isPrivate = project.visibility === "private";
  const isLocked = Boolean(project.privateRepository);
  const detailAvailable = !isPrivate || project.publishCaseStudy;
  const searchable = [project.name, auxiliaryName, project.safeSummary[locale], ...project.skills].filter(Boolean).join(" ").toLocaleLowerCase();
  const actions = [
    ...project.liveRoutes.map((route) => `<a class="row-action" href="${route}"${linkAttrs(route)}>${escapeHtml(copy.live)}</a>`),
    detailAvailable ? `<a class="row-action" href="${localePath(locale, projectDetailSuffix(project))}">${escapeHtml(project.publishCaseStudy ? copy.caseStudy : copy.details)}</a>` : "",
    project.githubUrl ? `<a class="row-action" href="${project.githubUrl}" target="_blank" rel="noreferrer">${escapeHtml(copy.github)}${icons.external}</a>` : "",
    isLocked ? `<span class="locked-state">${icons.lock}${escapeHtml(copy.locked)}</span>` : ""
  ].filter(Boolean).join("");
  return `<article class="archive-row" data-project-row data-category="${project.category}" data-origin="${project.origin}" data-visibility="${project.visibility}" data-featured="${project.featured}" data-score="${project.score}" data-updated="${project.updatedAt || ""}" data-name="${escapeHtml(project.name)}" data-search="${escapeHtml(searchable)}">
    <span class="row-index" data-row-index>${String(index + 1).padStart(2, "0")}</span>
    <div class="row-name"><h3>${escapeHtml(project.name)}</h3>${auxiliaryName ? `<p class="row-name-alt">${escapeHtml(auxiliaryName)}</p>` : ""}<div class="row-flags"><span class="row-flag">${escapeHtml(isPrivate ? copy.private : copy.public)}</span><span class="row-flag is-origin">${escapeHtml(project.origin === "fork" ? copy.fork : copy.original)}</span>${project.closedSource ? `<span class="row-flag is-closed">${escapeHtml(copy.closedSource)}</span>` : ""}${project.featured ? `<span class="row-flag">${escapeHtml(copy.filters.featured)}</span>` : ""}</div></div>
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
  const auxiliaryName = localizedAuxiliaryName(project, locale);
  const study = caseStudies[project.slug];
  const actionLinks = [
    ...project.liveRoutes.map((route) => `<a href="${route}"${linkAttrs(route)}>${escapeHtml(copy.live)}</a>`),
    project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" rel="noreferrer">${escapeHtml(copy.github)}</a>` : ""
  ].filter(Boolean).join("");
  const mainContent = study
    ? sectionOrder.map((key) => `<section class="case-section"><h2>${escapeHtml(sectionLabel(copy, key))}</h2><p>${escapeHtml(study.sections[key][locale])}</p></section>`).join("")
    : `<section class="case-section"><h2>${escapeHtml(copy.metadata)}</h2><p>${escapeHtml(copy.sourceRecord)}</p></section><section class="case-section"><h2>${escapeHtml(copy.technologies)}</h2><p>${escapeHtml(project.skills.join(" · "))}</p></section><section class="case-section"><h2>${escapeHtml(copy.evidence)}</h2><p>${escapeHtml(project.evidence.join(" · "))}</p></section>`;
  const assets = study?.assets || [];
  const status = [
    project.privateRepository ? copy.private : project.visibility === "private" ? copy.private : project.origin === "fork" ? copy.fork : copy.original,
    project.closedSource ? copy.closedSource : ""
  ].filter(Boolean).join(" · ");
  const aside = `<aside class="case-aside"><h2>${escapeHtml(copy.metadata)}</h2><dl class="archive-stats"><div><dt>${escapeHtml(copy.status)}</dt><dd>${escapeHtml(status)}</dd></div><div><dt>${escapeHtml(copy.updated)}</dt><dd>${escapeHtml(project.updatedAt?.slice(0, 10) || copy.noDate)}</dd></div></dl>${assets.length ? `<h2>${escapeHtml(copy.assets)}</h2><ul class="asset-nav">${assets.map((asset) => `<li><a href="${localePath(locale, `${suffix}${asset}/`)}">${escapeHtml(assetTitles[asset][locale])}</a></li>`).join("")}</ul>` : ""}<div class="related"><h2>${escapeHtml(copy.related)}</h2>${relatedProjects(project).map((related) => `<a href="${localePath(locale, projectDetailSuffix(related))}">${escapeHtml(related.name)}</a>`).join("")}</div></aside>`;
  const body = `<main id="main"><section class="case-hero"><h1>${escapeHtml(project.name)}</h1>${auxiliaryName ? `<p class="case-alt-name">${escapeHtml(auxiliaryName)}</p>` : ""}<p class="case-summary">${escapeHtml(project.safeSummary[locale])}</p><div class="case-actions">${actionLinks}<a href="${localePath(locale, "/projects/")}">${escapeHtml(copy.backArchive)}</a></div></section><div class="detail-main"><article class="case-content">${mainContent}</article>${aside}</div></main>`;
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
if (upworkEnabled) {
  const upworkArtifact = upworkPage();
  ensureResolved(upworkArtifact, "Upwork entry page");
  await writeOutput("upwork/index.html", upworkArtifact);
  for (const portfolio of upworkPortfolio) {
    const artifact = upworkCasePage(portfolio);
    ensureResolved(artifact, `Upwork ${portfolio.slug} case page`);
    await writeOutput(`upwork/${portfolio.slug}/index.html`, artifact);
  }
  sitemapPaths.push("/upwork/", ...upworkPortfolio.map((portfolio) => `/upwork/${portfolio.slug}/`));
}
for (const locale of localeList) {
  if (locale !== "en") {
    await writeOutput(`${localeConfig[locale].prefix.replace(/^\//, "")}/index.html`, homeArtifact);
    sitemapPaths.push(localeConfig[locale].prefix + "/");
  }
  const hireSuffix = "/hire/";
  const hireArtifact = hirePage(locale);
  ensureResolved(hireArtifact, `${locale} hire page`);
  await writeOutput(`${localePath(locale, hireSuffix).replace(/^\//, "")}index.html`, hireArtifact);
  sitemapPaths.push(localePath(locale, hireSuffix));
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(sitemapPaths)].map((path) => `  <url><loc>${escapeHtml(absoluteUrl(path))}</loc><lastmod>${path.endsWith("/hire/") ? "2026-09-07" : "2026-08-17"}</lastmod></url>`).join("\n")}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
const feedItems = [bySlug.get("heatstack"), bySlug.get("pulseboard"), bySlug.get("career-radar")].filter(Boolean).map((project) => `<item><title>${escapeHtml(project.name)}</title><link>${escapeHtml(absoluteUrl(projectDetailSuffix(project)))}</link><guid>${escapeHtml(absoluteUrl(projectDetailSuffix(project)))}</guid><pubDate>Mon, 17 Aug 2026 00:00:00 GMT</pubDate><description>${escapeHtml(project.safeSummary.en)}</description></item>`).join("");
const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>ANLAN.STORE Project Updates</title><link>${siteUrl}/projects/</link><description>Durable engineering evidence and project case studies by Dodge Ho.</description>${feedItems}</channel></rss>\n`;
await writeOutput("sitemap.xml", sitemap);
await writeOutput("robots.txt", robots);
await writeOutput("feed.xml", feed);

for (const privateName of privateNames) {
  const escapedName = privateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const privateUrlPattern = new RegExp(`https?://(?:www\\.)?github\\.com/DodgeHo/${escapedName}(?:[/?#\\s\"']|$)`, "i");
  const hireArtifacts = localeList.map((locale) => hirePage(locale));
  for (const content of [homeArtifact, sitemap, feed, ...hireArtifacts]) {
    if (privateUrlPattern.test(content)) throw new Error(`Generated core artifact leaks private repository URL: ${privateName}`);
  }
}

console.log(`Built ANLAN.STORE: ${snapshot.counts.total} repositories, ${projects.length} archive records, ${sitemapPaths.length} localized URLs.`);
