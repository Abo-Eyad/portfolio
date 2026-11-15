"""Re-encode the owner's hero frames for the web: assets/frames -> assets/frames-web.

The originals (1280x720, ~12 MB for 80 frames) stay untouched; the static build ships
these smaller copies instead. Requires Pillow. Run: python scripts/optimize-frames.py
"""
from pathlib import Path

from PIL import Image

SOURCE, TARGET = Path("assets/frames"), Path("assets/frames-web")
TARGET.mkdir(exist_ok=True)
frames = sorted(SOURCE.glob("frame-*.jpg"))
assert len(frames) == 80, f"expected 80 frames, found {len(frames)}"
for frame in frames:
    image = Image.open(frame).convert("RGB").resize((960, 540), Image.LANCZOS)
    image.save(TARGET / frame.name, "JPEG", quality=50, optimize=True, progressive=True)
before = sum(f.stat().st_size for f in frames)
after = sum(f.stat().st_size for f in TARGET.glob("frame-*.jpg"))
print(f"{len(frames)} frames: {before // 1024} KB -> {after // 1024} KB")
