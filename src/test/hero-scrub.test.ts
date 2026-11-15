import { describe, expect, it } from "vitest";
import {
  capDevicePixelRatio,
  coverFit,
  easeFrameIndex,
  HERO_EAGER_FRAMES,
  HERO_FRAME_COUNT,
  nearestLoadedFrame,
  targetFrameIndex,
} from "@/components/site/hero-scrub";
import { HERO_FRAMES } from "@/components/site/hero-frames";

describe("Owner's canvas frame-sequence rules", () => {
  it("provides exactly 80 ordered frames with the first 8 eager", () => {
    expect(HERO_FRAME_COUNT).toBe(80);
    expect(HERO_EAGER_FRAMES).toBe(8);
    expect(HERO_FRAMES).toHaveLength(80);
    expect(HERO_FRAMES[0]).toContain("/frame-001.jpg");
    expect(HERO_FRAMES[79]).toContain("/frame-080.jpg");
    expect(new Set(HERO_FRAMES).size).toBe(80);
  });

  it("caps device pixel ratio at 2", () => {
    expect(capDevicePixelRatio(1)).toBe(1);
    expect(capDevicePixelRatio(1.5)).toBe(1.5);
    expect(capDevicePixelRatio(3)).toBe(2);
  });

  it("maps scroll progress from frame 0 through frame 79", () => {
    expect(targetFrameIndex(0)).toBe(0);
    expect(targetFrameIndex(0.5)).toBe(39.5);
    expect(targetFrameIndex(1)).toBe(79);
    expect(targetFrameIndex(-1)).toBe(0);
    expect(targetFrameIndex(2)).toBe(79);
  });

  it("eases toward the target with a factor of 0.2", () => {
    expect(easeFrameIndex(2, 12)).toBe(4);
  });

  it("draws the nearest loaded frame at or below the target", () => {
    const loaded = Array.from({ length: 80 }, (_, index) => index === 0 || index === 3 || index === 7);
    expect(nearestLoadedFrame(7.9, loaded)).toBe(7);
    expect(nearestLoadedFrame(6.9, loaded)).toBe(3);
    expect(nearestLoadedFrame(2.9, loaded)).toBe(0);
  });

  it("returns no frame before frame 0 is loaded", () => {
    expect(nearestLoadedFrame(20, Array(80).fill(false))).toBeNull();
  });

  it("cover-fits and centres landscape frames on wide screens", () => {
    expect(coverFit(1920, 1080, 1280, 720)).toEqual({ scale: 1.5, width: 1920, height: 1080, x: 0, y: 0 });
  });

  it("cover-fits and centres landscape frames on narrow screens", () => {
    const fit = coverFit(390, 844, 1280, 720);
    expect(fit.scale).toBe(844 / 720);
    expect(fit.height).toBe(844);
    expect(fit.width).toBeGreaterThan(390);
    expect(fit.y).toBe(0);
    expect(fit.x).toBe((390 - fit.width) / 2);
  });
});
