import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("Portable static artifact", () => {
  it("uses a fetch-style prerender entry without opening a listening server", async () => {
    const config = await readFile(path.resolve("vite.config.ts"), "utf8");
    expect(config).toMatch(/preset:\s*"standard"/);
    const entry = await readFile(path.resolve("node_modules/nitro/dist/presets/standard/runtime/server.mjs"), "utf8");
    // Execute the installed preset's entry with its virtual Nitro app supplied
    // locally: prerender must be able to call default.fetch and then exit.
    const stubbedEntry = entry
      .replace('import "#nitro/virtual/polyfills";', "")
      .replace('import { useNitroApp } from "nitro/app";',
        'const useNitroApp = () => ({ fetch: () => new Response("prerender-ready") });');
    const source = `const { default: server } = await import(${JSON.stringify(`data:text/javascript,${encodeURIComponent(stubbedEntry)}`)}); console.log(await (await server.fetch(new Request("http://localhost/"))).text());`;
    expect(execFileSync(process.execPath, ["--input-type=module", "-e", source], {
      encoding: "utf8", timeout: 5000,
    }).trim()).toBe("prerender-ready");
  });

  it("exports all 80 owner frames and relative asset URLs without a Worker", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "portfolio-export-"));
    try {
      await mkdir(path.join(directory, "dist/client/assets"), { recursive: true });
      await mkdir(path.join(directory, "assets/frames"), { recursive: true });
      for (let index = 1; index <= 80; index++) {
        await writeFile(path.join(directory, `assets/frames/frame-${String(index).padStart(3, "0")}.jpg`), new Uint8Array([255, 216, index]));
      }
      await writeFile(path.join(directory, "dist/client/index.html"), '<h1>Ahmed</h1><canvas data-testid="hero-canvas"></canvas><script src="/assets/app.js"></script><img src="/__l5e/assets-v1/id/frame-001.jpg">');
      await writeFile(path.join(directory, "dist/client/assets/app.js"), 'const frames=["/__l5e/assets-v1/id/frame-080.jpg"];');
      await writeFile(path.join(directory, "dist/client/_worker.js"), "private server");
      execFileSync(process.execPath, [path.resolve("scripts/prepare-static.mjs")], { cwd: directory });
      expect(await readFile(path.join(directory, "dist/index.html"), "utf8")).toContain('src="./assets/app.js"');
      expect(await readFile(path.join(directory, "dist/assets/app.js"), "utf8")).toContain('"./assets/frames/frame-080.jpg"');
      expect(await readFile(path.join(directory, "dist/assets/frames/frame-080.jpg"))).toEqual(Buffer.from([255, 216, 80]));
      expect(await readFile(path.join(directory, "dist/assets/frames-hd/frame-080.jpg"))).toEqual(Buffer.from([255, 216, 80]));
      await expect(readFile(path.join(directory, "dist/_worker.js"))).rejects.toThrow();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("keeps h3's srvx/body-limit import out of the standard preset's srvx prefix alias", async () => {
    const config = await readFile(path.resolve("vite.config.ts"), "utf8");
    expect(config).toMatch(/alias:\s*\{\s*"srvx\/body-limit":\s*"srvx\/body-limit"\s*\}/);
  });

  it("packages the external build's .output/public into dist and drops storage pointers", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "portfolio-external-"));
    try {
      await mkdir(path.join(directory, ".output/public/assets/frames"), { recursive: true });
      await mkdir(path.join(directory, "dist/server"), { recursive: true });
      await mkdir(path.join(directory, "assets/frames"), { recursive: true });
      for (let index = 1; index <= 80; index++) {
        const name = `frame-${String(index).padStart(3, "0")}.jpg`;
        await writeFile(path.join(directory, "assets/frames", name), new Uint8Array([255, 216, index]));
        await writeFile(path.join(directory, ".output/public/assets/frames", `${name}.asset.json`), "{}");
      }
      await writeFile(path.join(directory, ".output/public/index.html"), '<h1>Ahmed</h1><canvas data-testid="hero-canvas"></canvas><link href="/favicon.png">');
      execFileSync(process.execPath, [path.resolve("scripts/prepare-static.mjs")], { cwd: directory });
      expect(await readFile(path.join(directory, "dist/index.html"), "utf8")).toContain('href="./favicon.png"');
      expect(await readFile(path.join(directory, "dist/assets/frames/frame-001.jpg"))).toEqual(Buffer.from([255, 216, 1]));
      await expect(readFile(path.join(directory, "dist/assets/frames/frame-001.jpg.asset.json"))).rejects.toThrow();
      await expect(readFile(path.join(directory, "dist/server"))).rejects.toThrow();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
