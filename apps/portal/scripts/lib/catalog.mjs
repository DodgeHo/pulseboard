import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { caseStudies, liveProjects, privateSummary, repositoryOverrides } from "../../content/project-overrides.mjs";

const localeList = ["en", "zh-Hant", "zh-Hans", "ja"];
const researchPattern = /(vmd|ceemdan|signal|fourier|eeg|rpca|shapecontext|polyaseq|hmm|matlab|pathplanning|rrt|cycada|auvsi|dsp|ros)/i;
const learningPattern = /(learning|tutorial|scaffold|notebook|calculator|lottery|web3|trainingplan|question)/i;

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const defaultSummary = (repository) => {
  if (repository.visibility === "private") return privateSummary;
  if (repository.fork) {
    return {
      en: "A fork retained as part of the engineering learning record. Upstream authorship remains explicit, and this entry is not presented as original work.",
      "zh-Hant": "作為工程學習記錄保留的 Fork。上游作者身分清楚標示，本項目不作為完全原創作品呈現。",
      "zh-Hans": "作为工程学习记录保留的 Fork。上游作者身份清楚标示，本项目不作为完全原创作品呈现。",
      ja: "エンジニアリング学習記録として残した Fork です。上流の作者を明示し、完全なオリジナル作品としては扱いません。"
    };
  }
  const language = repository.language || "software";
  return {
    en: `An original public ${language} repository in the complete engineering archive. Source history is available for direct inspection on GitHub.`,
    "zh-Hant": `完整工程檔案中的原創公開 ${language} 儲存庫，可在 GitHub 直接檢查原始碼歷史。`,
    "zh-Hans": `完整工程档案中的原创公开 ${language} 仓库，可在 GitHub 直接检查源码历史。`,
    ja: `完全なエンジニアリング目録に含まれるオリジナルの公開 ${language} リポジトリです。GitHub でソース履歴を確認できます。`
  };
};

const categoryFor = (repository, override) => {
  if (override.category) return override.category;
  if (repository.visibility === "private") return "private";
  if (repository.fork) return "contributions";
  if (researchPattern.test(repository.name) || repository.topics?.some((topic) => researchPattern.test(topic))) return "research";
  if (learningPattern.test(repository.name)) return "learning";
  return "applications";
};

const scoreFor = (repository, override) => {
  if (override.score) return override.score;
  if (repository.visibility === "private") return 28;
  if (repository.fork) return 18;
  return repository.language ? 42 : 34;
};

export async function loadCatalog(packageRoot) {
  const snapshot = JSON.parse(await readFile(resolve(packageRoot, "content/github-inventory.json"), "utf8"));
  const repositories = snapshot.repositories.map((repository) => {
    const override = repositoryOverrides[repository.name] || {};
    const origin = repository.fork ? "fork" : "original";
    const skills = override.skills || [repository.language, ...(repository.topics || [])].filter(Boolean).slice(0, 4);
    const project = {
      name: repository.name,
      slug: override.slug || slugify(repository.name),
      visibility: repository.visibility,
      origin,
      featured: Boolean(override.featured),
      showInArchive: override.showInArchive !== false,
      publishCaseStudy: Boolean(override.publishCaseStudy),
      category: categoryFor(repository, override),
      score: scoreFor(repository, override),
      skills: skills.length ? skills : [origin === "fork" ? "Learning fork" : "Repository archive"],
      liveRoutes: override.liveRoutes || [],
      evidence: override.evidence || [repository.visibility === "public" ? "Source" : "Inventory record"],
      safeSummary: override.safeSummary || defaultSummary(repository),
      updatedAt: repository.updatedAt || null,
      archived: Boolean(repository.archived),
      ...(repository.visibility === "public" ? { githubUrl: repository.url } : {})
    };
    if (repository.visibility === "private" && Object.hasOwn(project, "githubUrl")) {
      throw new Error(`Private repository ${repository.name} must not carry a GitHub URL`);
    }
    return project;
  });

  const projects = [...repositories, ...liveProjects]
    .filter((project) => project.showInArchive)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, "en"));

  const slugs = new Set();
  for (const project of projects) {
    if (slugs.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
    slugs.add(project.slug);
    for (const locale of localeList) {
      if (!project.safeSummary?.[locale]) throw new Error(`Missing ${locale} safe summary for ${project.name}`);
    }
  }

  const repositoryNames = new Set(repositories.map((repository) => repository.name));
  if (repositoryNames.size !== snapshot.counts.total) throw new Error("Repository inventory contains duplicates");

  return { snapshot, projects, repositories, caseStudies };
}

export { localeList };
