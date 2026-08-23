import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");
const publicFiles = ["index.html", "styles.css", "app.js", "favicon.svg", "_headers"];

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

for (const file of publicFiles) {
  const source = resolve(projectRoot, file);
  if (!existsSync(source)) {
    throw new Error(`Missing public file: ${file}`);
  }
  cpSync(source, resolve(outputRoot, file));
}

console.log(`Built ${publicFiles.length} public files in dist/`);
