import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const targets = [
  resolve(packageRoot, "dist/index.html"),
  resolve(packageRoot, "../../deploy/anlan/index.html")
];

const requiredText = [
  "ANLAN.STORE",
  "DODGE HO.<br>BUILDS IN PUBLIC.",
  "id=\"signal-lattice\"",
  "data-locale=\"en\"",
  "data-locale=\"zh-Hant\"",
  "data-locale=\"zh-Hans\"",
  "data-locale=\"ja\"",
  "https://www.linkedin.com/in/lang-he-a94655120/",
  "My LinkedIn profile",
  "道安澜",
  "道安瀾",
  "HeatStack",
  "AI 热栈",
  "VMD_cpp",
  "PAL4_EnglishMod",
  "https://github.com/DodgeHo/VMD_cpp",
  "https://github.com/DodgeHo/PAL4_EnglishMod",
  "route: '/heatstack/'",
  "route: '/demo/'",
  "route: '/jobs/'",
  "route: '/saa/'",
  "route: '/sap/'",
  "railKeywords: ['Astro', 'AI Skills', 'Windows CLI']",
  "railKeywords: ['Hono', 'PostgreSQL', 'Redis']",
  "railKeywords: ['invite-only', 'inbox', 'digests']",
  "railKeywords: ['AWS', 'questions', 'progress']",
  "railKeywords: ['AWS', 'architecture', 'advanced']",
  "railKeywords: ['ITSM', 'study', 'unlinked']",
  "railKeywords: ['C++', 'Eigen', 'VMD']",
  "railKeywords: ['Python', 'localization', 'MIT']",
  "railKeywords: ['GPT', 'writing', 'Python']",
  "railKeywords: ['Python', 'robotics', 'RRT']",
  "layout: 'feature'",
  "layout: 'research'",
  "const localeStorageKey = 'anlan.portal.locale'",
  "document.documentElement.lang = currentLocale",
  "data:image/png;base64,"
];

for (const target of targets) {
  const [artifact, metadata] = await Promise.all([readFile(target, "utf8"), stat(target)]);
  for (const text of requiredText) {
    if (!artifact.includes(text)) {
      throw new Error(target + " is missing required content: " + text);
    }
  }
  if (/__[A-Z0-9_]+__/.test(artifact)) {
    throw new Error(target + " contains an unresolved build placeholder");
  }
  if (artifact.includes("route: '/ispm/'") || artifact.includes('href="/ispm/"') || artifact.includes('href="#project-ispm"')) {
    throw new Error(target + " must not expose an ISPM route action from the portal");
  }
  const localizedPortalMarkers = [
    String.fromCodePoint(0x4e2d, 0x56fd, 0x8a9e, 0x540d, 0x306f, 0x9053, 0x5b89, 0x703e),
    String.fromCodePoint(0x50c5, 0x9650, 0x53d7, 0x9080),
    String.fromCodePoint(0x4ec5, 0x9650, 0x53d7, 0x9080),
    String.fromCodePoint(0x62db, 0x5f85, 0x5236)
  ];
  for (const marker of localizedPortalMarkers) {
    if (!artifact.includes(marker)) {
      throw new Error(target + " is missing localized portal marker: " + marker);
    }
  }
  const imageCount = (artifact.match(/data:image\/png;base64,/g) || []).length;
  if (imageCount !== 2) {
    throw new Error(target + " must inline exactly two PNG previews; found " + imageCount);
  }
  if (metadata.size < 100_000) {
    throw new Error(target + " is unexpectedly small: " + metadata.size + " bytes");
  }
  console.log("Verified " + target + " (" + metadata.size + " bytes)");
}
