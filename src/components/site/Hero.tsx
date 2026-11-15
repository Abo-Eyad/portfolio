import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useLang } from "./lang";
import { links } from "@/content/portfolio";
import { Button } from "@/components/ui/button";
import { HERO_FRAMES } from "./hero-frames";
import {
  canvasRatio,
  coverFit,
  easeFrameIndex,
  HERO_EAGER_FRAMES,
  nearestLoadedFrame,
  targetFrameIndex,
} from "./hero-scrub";

export const HERO_POSTER = `${import.meta.env.BASE_URL}assets/videos/hero-poster.jpg`;

export function Hero() {
  const { t, lang } = useLang();
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const loadedFrames = useRef<boolean[]>([]);
  const words = useRef<HTMLSpanElement[]>([]);
  const details = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    setLoadError(false);

    const images = HERO_FRAMES.map(() => {
      const image = new Image();
      image.decoding = "async";
      return image;
    });
    const loaded = Array<boolean>(HERO_FRAMES.length).fill(false);
    frames.current = images;
    loadedFrames.current = loaded;

    const loadFrame = async (index: number) => {
      const image = images[index];
      const source = HERO_FRAMES[index];
      if (!image || !source) return;
      try {
        image.fetchPriority = index < HERO_EAGER_FRAMES ? "high" : "low";
        // Only fetch here; decoding all 80 frames up front burns CPU and the cache evicts them anyway.
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = source;
        });
        if (cancelled) return;
        loaded[index] = true;
      } catch {
        if (!cancelled) setLoadError(true);
      }
    };

    void (async () => {
      await Promise.all(
        Array.from({ length: HERO_EAGER_FRAMES }, (_, index) => loadFrame(index)),
      );
      for (let index = HERO_EAGER_FRAMES; index < HERO_FRAMES.length; index++) {
        if (cancelled) return;
        await loadFrame(index);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reduced]);

  useEffect(() => {
    let raf = 0;
    let current = 0;
    let active = false;
    let lastDrawn = -1;
    let sizeDirty = true;
    let decoding = false;
    let lastDetails = -1;
    const canvasElement = canvas.current;
    const context = canvasElement?.getContext("2d") ?? null;

    const resizeCanvas = () => {
      if (!canvasElement) return;
      const rect = canvasElement.getBoundingClientRect();
      const ratio = canvasRatio(rect.width, rect.height, window.devicePixelRatio);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvasElement.width !== width || canvasElement.height !== height) {
        canvasElement.width = width;
        canvasElement.height = height;
      }
      sizeDirty = true;
    };

    const drawFrame = (index: number) => {
      if (!canvasElement || !context || decoding || !loadedFrames.current[index]) return;
      const image = frames.current[index];
      if (!image) return;
      // Decode off the main thread first: a synchronous JPEG decode inside drawImage janks old phones.
      decoding = true;
      void image.decode().catch(() => undefined).then(() => {
        decoding = false;
        const fit = coverFit(canvasElement.width, canvasElement.height, image.naturalWidth, image.naturalHeight);
        context.drawImage(image, fit.x, fit.y, fit.width, fit.height);
        canvasElement.dataset["frameIndex"] = String(index);
        lastDrawn = index;
        sizeDirty = false;
      });
    };

    const tick = () => {
      if (!active) return;
      const el = section.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const span = Math.max(1, rect.height - window.innerHeight);
        const p = reduced ? 1 : Math.min(1, Math.max(0, -rect.top / span));
        const target = targetFrameIndex(p);
        current = reduced ? target : easeFrameIndex(current, target);

        if (!reduced) {
          const index = nearestLoadedFrame(current, loadedFrames.current);
          if (index !== null && (index !== lastDrawn || sizeDirty)) drawFrame(index);
        }

        const n = words.current.length;
        words.current.forEach((word, index) => {
          if (!word) return;
          const on = reduced || p >= (index / n) * 0.45 ? "1" : "0";
          if (word.dataset["on"] !== on) word.dataset["on"] = on;
        });
        const d = reduced ? 1 : Math.min(1, Math.max(0, (p - 0.45) / 0.2));
        if (details.current && d !== lastDetails) {
          lastDetails = d;
          details.current.style.opacity = String(d);
          details.current.style.transform = `translateY(${(1 - d) * 24}px)`;
          details.current.style.pointerEvents = d > 0.5 ? "auto" : "none";
        }
      }
      raf = requestAnimationFrame(tick);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvasElement) resizeObserver.observe(canvasElement);

    const el = section.current;
    if (!el) return () => resizeObserver.disconnect();
    const observer = new IntersectionObserver(([entry]) => {
      const next = entry?.isIntersecting ?? false;
      if (next === active) return;
      active = next;
      if (active) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    }, { rootMargin: "150px" });
    observer.observe(el);

    return () => {
      active = false;
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced, lang]);

  const headWords = t.hero.headline.split(" ");
  words.current = [];

  return (
    <section id="top" ref={section} className={reduced ? "relative h-screen" : "relative h-[400vh]"}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <img src={HERO_POSTER} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {!reduced && (
          <canvas
            ref={canvas}
            aria-hidden
            data-testid="hero-canvas"
            className="absolute inset-0 h-full w-full"
          />
        )}
        <div className="absolute inset-0 hero-scrim" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col overflow-y-auto px-5 pb-8 pt-28 md:justify-end md:overflow-visible md:pb-24 md:pt-24">
          <div className="shrink-0">
          <p className="eyebrow mb-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 leading-5 md:flex">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="min-w-0 whitespace-normal">{t.hero.status}</span>
          </p>
          <p className="mb-4 font-display text-lg text-foreground md:text-2xl" dir="ltr">{t.brand}</p>
          <h1 className="text-5xl font-semibold leading-tight md:text-7xl lg:text-8xl">
            {headWords.map((word, index) => (
              <span key={`${lang}-${index}`} ref={(el) => { if (el) words.current[index] = el; }} className="hero-word me-[0.25em]">
                {word}
              </span>
            ))}
          </h1>
          <div ref={details} className="mt-8 max-w-3xl" style={{ opacity: 0 }}>
            <p className="font-display text-base text-primary md:text-lg">{t.hero.role}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{t.hero.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-link shadow-none"><a href="#contact">{t.hero.ctaContact}</a></Button>
              <Button asChild variant="outline" className="shadow-none"><a href="#tools">{t.hero.ctaTools}</a></Button>
              <Button asChild variant="outline" className="shadow-none"><a href={links.cv} target="_blank" rel="noreferrer">{t.hero.ctaCv}</a></Button>
            </div>
            <dl className="mt-10 flex gap-10">
              {t.hero.stats.map(([number, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-semibold text-foreground">{number}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          {loadError && (
            <p role="status" className="mt-6 text-xs text-muted-foreground">
              {t.hero.frameError}
            </p>
          )}
          </div>
          {!reduced && (
            <div className="absolute bottom-6 end-5 hidden items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground md:flex">
              {t.hero.scroll} <ArrowDown size={14} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
