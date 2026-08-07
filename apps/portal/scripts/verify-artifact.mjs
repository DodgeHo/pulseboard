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
  "Live project<br>directory.",
  "href=\"/demo/\"",
  "href=\"/saa/\"",
  "href=\"/sap/\"",
  "href=\"/ispm/\"",
  "data-filter=\"systems\"",
  "data-preview-target=\"customer\"",
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
  const imageCount = (artifact.match(/data:image\/png;base64,/g) || []).length;
  if (imageCount !== 2) {
    throw new Error(target + " must inline exactly two PNG previews; found " + imageCount);
  }
  if (metadata.size < 100_000) {
    throw new Error(target + " is unexpectedly small: " + metadata.size + " bytes");
  }
  console.log("Verified " + target + " (" + metadata.size + " bytes)");
}
