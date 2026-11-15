import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Export server dependency compatibility", () => {
  it("installs srvx 0.12.4 at the root, satisfying h3's ^0.12.4 requirement", async () => {
    const h3 = JSON.parse(await readFile(path.resolve("node_modules/h3/package.json"), "utf8"));
    const srvx = JSON.parse(await readFile(path.resolve("node_modules/srvx/package.json"), "utf8"));
    expect(h3.dependencies.srvx).toBe("^0.12.4");
    expect(srvx.version).toBe("0.12.4");
  });

  it("resolves and executes the body-limit export required by h3", () => {
    const require = createRequire(path.resolve("node_modules/h3/package.json"));
    expect(require.resolve("srvx/body-limit")).toMatch(/body-limit\.mjs$/);
    expect(execFileSync(process.execPath, ["--input-type=module", "-e",
      'const { limitRequestBody } = await import("srvx/body-limit"); console.log(typeof limitRequestBody);',
    ], { encoding: "utf8", timeout: 5000 }).trim()).toBe("function");
  });
});