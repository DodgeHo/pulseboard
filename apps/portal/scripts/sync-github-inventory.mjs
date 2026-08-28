import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(packageRoot, "content/github-inventory.json");

const query = [
  ".[] | {",
  "name, visibility, fork, archived,",
  "url: (if .visibility == \"public\" then .html_url else null end),",
  "language: (if .visibility == \"public\" then .language else null end),",
  "topics: (if .visibility == \"public\" then (.topics // []) else [] end),",
  "updatedAt: (if .visibility == \"public\" then .updated_at else null end)",
  "} | @json"
].join(" ");

const stdout = execFileSync("gh", [
  "api", "--method", "GET", "user/repos",
  "-f", "affiliation=owner",
  "-f", "per_page=100",
  "--paginate",
  "--jq", query
], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });

const repositories = stdout
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .map((repository) => ({
    name: repository.name,
    visibility: repository.visibility,
    fork: Boolean(repository.fork),
    archived: Boolean(repository.archived),
    ...(repository.visibility === "public" ? {
      url: repository.url,
      language: repository.language,
      topics: repository.topics,
      updatedAt: repository.updatedAt
    } : {})
  }))
  .sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base" }));

const counts = {
  total: repositories.length,
  public: repositories.filter((repository) => repository.visibility === "public").length,
  private: repositories.filter((repository) => repository.visibility === "private").length,
  forks: repositories.filter((repository) => repository.fork).length,
  original: repositories.filter((repository) => !repository.fork).length,
  archived: repositories.filter((repository) => repository.archived).length
};

let previous = null;
try {
  previous = JSON.parse(await readFile(outputPath, "utf8"));
} catch {
  // The first sync creates the snapshot.
}

const snapshot = {
  schemaVersion: 1,
  owner: "DodgeHo",
  syncedAt: new Date().toISOString(),
  counts,
  repositories
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

console.log(`Wrote ${outputPath}`);
console.log(`Repositories: ${counts.total} total, ${counts.public} public, ${counts.private} private, ${counts.forks} forks, ${counts.original} original`);
if (previous) {
  const previousNames = new Set(previous.repositories.map((repository) => repository.name));
  const currentNames = new Set(repositories.map((repository) => repository.name));
  const added = repositories.filter((repository) => !previousNames.has(repository.name)).map((repository) => repository.name);
  const removed = previous.repositories.filter((repository) => !currentNames.has(repository.name)).map((repository) => repository.name);
  if (added.length) console.log("Added: " + added.join(", "));
  if (removed.length) console.log("Removed: " + removed.join(", "));
}
