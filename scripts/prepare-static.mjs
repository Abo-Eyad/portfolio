import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// Lovable builds put public files in dist/client; external (standard preset) builds put
// them in .output/public and leave only an intermediate dist/server behind.
const publicOutput = [path.resolve("dist/client"), path.resolve(".output/public")].find((dir) =>
  existsSync(path.join(dir, "index.html")),
);
if (!publicOutput) throw new Error("No prerendered index.html in dist/client or .output/public.");
const staging = path.resolve(".static-export-staging");
await rm(staging, { recursive: true, force: true });
await cp(publicOutput, staging, { recursive: true });
await rm("dist", { recursive: true, force: true });
await cp(staging, "dist", { recursive: true });
await rm(staging, { recursive: true, force: true });

// No Worker or platform deployment metadata belongs in a static Pages artifact.
for (const entry of ["_worker.js", "wrangler.json", "wrangler.jsonc", ".lovable", "_headers"]) {
  await rm(path.join("dist", entry), { recursive: true, force: true });
}
const html = await readFile("dist/index.html", "utf8");
if (!html.includes("Ahmed") || !html.includes("hero-canvas")) {
  throw new Error("Static export is missing the rendered portfolio and hero canvas.");
}
// The existing repository's original media remains untouched. Copy it into the artifact;
// a clean project export can also retrieve the owner's exact originals at build time.
const frameDirectory = path.join("dist", "assets", "frames");
await mkdir(frameDirectory, { recursive: true });
// Lovable storage pointers are not media; the real JPEGs replace them below.
for (const name of await readdir(frameDirectory)) {
  if (name.endsWith(".asset.json")) await rm(path.join(frameDirectory, name));
}
for (let index = 1; index <= 80; index++) {
  const filename = `frame-${String(index).padStart(3, "0")}.jpg`;
  const destination = path.join(frameDirectory, filename);
  // Prefer the web-sized copies from scripts/optimize-frames.py; the originals are ~2x the bytes.
  const original = [path.join("assets", "frames-web", filename), path.join("assets", "frames", filename), path.join("public", "assets", "frames", filename)].find(existsSync);
  if (original) {
    await cp(original, destination);
  } else if (!existsSync(destination)) {
    const response = await fetch(`https://raw.githubusercontent.com/Abo-Eyad/portfolio/main/assets/frames/${filename}`);
    if (!response.ok) throw new Error(`Owner frame download failed: ${filename} (${response.status}).`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error(`Invalid JPEG: ${filename}.`);
    await writeFile(destination, bytes);
  }
}

// Start's SSR manifest may emit root-relative bundles. Also replace Lovable-only frame
// proxy paths in the built HTML/JS with portable references to the copied originals.
async function makePortable(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await makePortable(filename);
    else if (/\.(html|js)$/.test(entry.name)) {
      const source = await readFile(filename, "utf8");
      const portable = source
        .replace(/\/__l5e\/assets-v1\/[^/"\s]+\/(frame-\d{3}\.jpg)/g, "./assets/frames/$1")
        .replace(/(["'])\/(?:\.\/)?assets\//g, "$1./assets/")
        .replace(/(["'])\/favicon\.png/g, "$1./favicon.png");
      await writeFile(filename, portable);
    }
  }
}
await makePortable("dist");
const finalHtml = await readFile("dist/index.html", "utf8");
if (/(?:src|href)=["']\/(?!\/)/.test(finalHtml)) {
  throw new Error("Static HTML still contains a root-relative resource URL.");
}
await writeFile("dist/.nojekyll", "");
console.log(`Static export ready: dist/index.html (${(await readdir("dist")).length} entries).`);