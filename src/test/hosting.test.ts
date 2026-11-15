import { describe, expect, it } from "vitest";
import { portfolioBasepath } from "@/lib/hosting";

describe("Static host paths", () => {
  it("mounts at /portfolio/ on GitHub Pages", () => {
    expect(portfolioBasepath("/portfolio/")).toBe("/portfolio");
    expect(portfolioBasepath("/portfolio/index.html")).toBe("/portfolio");
  });
  it("mounts at / on Cloudflare Pages", () => {
    expect(portfolioBasepath("/")).toBe("/");
    expect(portfolioBasepath("/index.html")).toBe("/");
  });
});
describe("Static host URL rewrite", () => {
  it("serves the home route at /portfolio/ and keeps generated links under /portfolio", async () => {
    const { portfolioRewrite } = await import("@/lib/hosting");
    const rewrite = portfolioRewrite("/portfolio")!;
    expect(rewrite.input({ url: new URL("https://abo-eyad.github.io/portfolio/") }).pathname).toBe("/");
    expect(rewrite.input({ url: new URL("https://abo-eyad.github.io/portfolio/index.html") }).pathname).toBe("/");
    expect(rewrite.output({ url: new URL("https://abo-eyad.github.io/") }).pathname).toBe("/portfolio/");
  });
  it("needs no rewrite at the root of Cloudflare Pages", async () => {
    const { portfolioRewrite } = await import("@/lib/hosting");
    expect(portfolioRewrite("/")).toBeUndefined();
  });
});
