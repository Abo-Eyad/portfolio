export const HERO_FRAME_COUNT = 80;
export const HERO_EAGER_FRAMES = 8;

export function capDevicePixelRatio(ratio: number) {
  return Math.min(2, Math.max(1, Number.isFinite(ratio) ? ratio : 1));
}

// A canvas denser than the cover-fitted 1280x720 originals adds fill cost on phones but no detail.
export function canvasRatio(cssWidth: number, cssHeight: number, devicePixelRatio: number, frameWidth = 1280, frameHeight = 720) {
  return Math.min(capDevicePixelRatio(devicePixelRatio), frameWidth / cssWidth, frameHeight / cssHeight);
}

// Static builds ship the 1280x720 originals in frames-hd beside the light scrub frames
// (scripts/prepare-static.mjs). Other hosts already serve originals, so there is no separate tier.
export function hdFrameUrl(url: string) {
  const hd = url.replace(/\/frames\/(frame-\d{3}\.jpg)$/, "/frames-hd/$1");
  return hd === url ? null : hd;
}

// Coarse-to-fine: every 8th frame and the final one first, so the whole scrub range works
// within seconds on a slow link and then fills in.
export function frameLoadOrder(count = HERO_FRAME_COUNT) {
  const level = (i: number) => (i % 8 === 0 || i === count - 1 ? 0 : i % 4 === 0 ? 1 : i % 2 === 0 ? 2 : 3);
  return Array.from({ length: count }, (_, i) => i).sort((a, b) => level(a) - level(b) || a - b);
}

export function targetFrameIndex(progress: number, frameCount = HERO_FRAME_COUNT) {
  const p = Math.min(1, Math.max(0, progress));
  return p * (frameCount - 1);
}

export function easeFrameIndex(current: number, target: number) {
  return current + (target - current) * 0.2;
}

export function nearestLoadedFrame(target: number, loaded: readonly boolean[]) {
  const first = Math.min(loaded.length - 1, Math.max(0, Math.floor(target)));
  for (let index = first; index >= 0; index--) {
    if (loaded[index]) return index;
  }
  return null;
}

export function coverFit(canvasWidth: number, canvasHeight: number, imageWidth: number, imageHeight: number) {
  const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    scale,
    width,
    height,
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2,
  };
}
