import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "../..");
const sourceRoot = resolve(packageRoot, "src");
const localOutput = resolve(packageRoot, "dist/index.html");
const deployOutput = resolve(repositoryRoot, "deploy/anlan/index.html");

const readText = (path) => readFile(path, "utf8");
const readDataUri = async (path, mimeType) => {
  const bytes = await readFile(path);
  return "data:" + mimeType + ";base64," + bytes.toString("base64");
};

const [template, css, javascript, operationsImage, customerImage] = await Promise.all([
  readText(resolve(sourceRoot, "index.html")),
  readText(resolve(sourceRoot, "styles.css")),
  readText(resolve(sourceRoot, "main.js")),
  readDataUri(resolve(sourceRoot, "assets/pulseboard-ops.png"), "image/png"),
  readDataUri(resolve(sourceRoot, "assets/pulseboard-customer.png"), "image/png")
]);

const replacements = new Map([
  ["__PORTAL_CSS__", css],
  ["__PORTAL_JS__", javascript],
  ["__PULSEBOARD_OPS_IMAGE__", operationsImage],
  ["__PULSEBOARD_CUSTOMER_IMAGE__", customerImage]
]);

let artifact = template;
for (const [placeholder, value] of replacements) {
  if (!artifact.includes(placeholder)) {
    throw new Error("Portal template is missing placeholder: " + placeholder);
  }
  artifact = artifact.replace(placeholder, value);
}

const remainingPlaceholder = artifact.match(/__[A-Z0-9_]+__/);
if (remainingPlaceholder) {
  throw new Error("Portal artifact still contains placeholder: " + remainingPlaceholder[0]);
}

for (const output of [localOutput, deployOutput]) {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, artifact, "utf8");
  console.log("Wrote " + output);
}
