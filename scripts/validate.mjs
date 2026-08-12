import { spawnSync } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectories = [
  "background",
  "options",
  "popup",
  "setup",
  "shared",
  "tests/unit",
];

const manifest = await readJson("manifest.json");
await validateManifest(manifest);
await validateScripts();
await validateHtmlAssets();
await validateLocales();

console.log("Validation passed.");

async function validateManifest(value) {
  if (value.manifest_version !== 3) {
    throw new Error("manifest.json must use Manifest V3.");
  }
  if (Number(value.minimum_chrome_version) < 111) {
    throw new Error("minimum_chrome_version must support color-mix().");
  }
  if (value.background?.type !== "module") {
    throw new Error("The extension service worker must be an ES module.");
  }

  const requiredPaths = [
    value.background.service_worker,
    value.action.default_popup,
    value.options_ui.page,
    ...Object.values(value.icons ?? {}),
  ];
  await Promise.all(requiredPaths.map(assertProjectFile));
}

async function validateScripts() {
  const scripts = [];
  for (const directory of sourceDirectories) {
    scripts.push(...(await findFiles(directory, /\.(?:js|mjs)$/)));
  }
  scripts.push("scripts/validate.mjs");

  for (const script of scripts) {
    const result = spawnSync(process.execPath, ["--check", script], {
      cwd: projectRoot,
      stdio: "inherit",
    });
    if (result.status !== 0) {
      throw new Error(`Syntax check failed: ${script}`);
    }
  }
}

async function validateHtmlAssets() {
  const htmlFiles = await findFiles(".", /\.html$/);
  for (const htmlFile of htmlFiles) {
    const source = await readProjectFile(htmlFile);
    for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const reference = match[1];
      if (reference.startsWith("#") || reference.includes(":")) {
        continue;
      }
      await assertProjectFile(path.join(path.dirname(htmlFile), reference));
    }
  }
}

async function validateLocales() {
  const chinese = await readJson("_locales/zh_CN/messages.json");
  const english = await readJson("_locales/en/messages.json");
  const chineseKeys = Object.keys(chinese).sort();
  const englishKeys = Object.keys(english).sort();

  if (JSON.stringify(chineseKeys) !== JSON.stringify(englishKeys)) {
    throw new Error("Chinese and English locale keys do not match.");
  }
}

async function findFiles(directory, pattern) {
  const directoryPath = path.join(projectRoot, directory);
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== ".git" && entry.name !== "dist") {
        files.push(...(await findFiles(relativePath, pattern)));
      }
    } else if (pattern.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

async function assertProjectFile(relativePath) {
  await access(path.join(projectRoot, relativePath));
}

async function readJson(relativePath) {
  return JSON.parse(await readProjectFile(relativePath));
}

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}
