import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ignoredSegments = new Set(["node_modules", ".verification", ".next", "dist"]);

async function walk(directory: string, files: string[] = []): Promise<string[]> {
  for (const entry of await readdir(directory)) {
    if (ignoredSegments.has(entry)) continue;

    const fullPath = join(directory, entry);
    const info = await stat(fullPath);

    if (info.isDirectory()) {
      await walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function relativePath(filePath: string): string {
  return relative(root, filePath).replaceAll("\\", "/");
}

const files = await walk(root);
const sourceFiles = files.map(relativePath);
const forbidden = sourceFiles.filter((file) => [".js", ".mjs"].includes(extname(file)));

if (forbidden.length > 0) {
  throw new Error(`Found non-TypeScript source files: ${forbidden.join(", ")}`);
}

const required = [
  "apps/shell/src/main.tsx",
  "apps/shell/src/App.tsx",
  "apps/shell/src/remotes.ts",
  "apps/shell/vite.config.ts",
  "packages/shared-ui/src/index.tsx",
  "packages/mock-data/src/index.ts",
  "packages/design-system/src/styles.css"
];

for (const file of required) {
  if (!sourceFiles.includes(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
};

if (!packageJson.dependencies?.react?.startsWith("^19")) {
  throw new Error("React 19 dependency is not configured.");
}

if (!packageJson.dependencies?.tailwindcss) {
  throw new Error("Tailwind dependency is not configured.");
}

const remoteFiles = sourceFiles.filter((file) => file.endsWith("/src/remoteEntry.tsx"));

for (const file of remoteFiles) {
  const content = await readFile(resolve(root, file), "utf8");

  if (!content.includes("export const routes")) {
    throw new Error(`${file} must export routes.`);
  }

  if (!content.includes("export default")) {
    throw new Error(`${file} must export a default React component.`);
  }
}

console.log(`Validated React 19 + TypeScript + Tailwind monorepo with ${remoteFiles.length} MFEs.`);
