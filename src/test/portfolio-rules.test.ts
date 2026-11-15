import { describe, expect, it } from "vitest";
import { content, emailAddress } from "@/content/portfolio";

describe("Owner's portfolio rules", () => {
  it("reveals the owner's domain email address", () => {
    expect(emailAddress()).toBe("ahmed@civil3d.si");
  });

  it("uses unversioned .NET in both languages", () => {
    expect(JSON.stringify(content)).not.toMatch(/\.NET\s*\d/iu);
  });

  it("keeps Civil 3D, Revit and Inventor product years", () => {
    for (const language of [content.en, content.ar]) {
      expect(language.tools.list[0]?.meta).toContain("Civil 3D 2025 · 2026 · 2027");
      expect(language.tools.list[1]?.meta).toContain("Revit 2025");
      expect(language.tools.list[2]?.meta).toContain("Inventor 2026");
    }
  });
});