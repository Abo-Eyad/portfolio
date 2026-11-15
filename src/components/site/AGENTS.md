
## Project rules
- All visible copy (EN + AR) lives in `src/content/portfolio.ts`; components only read it via `useLang()` so both languages stay in sync.
- The hero uses owner-supplied still frames through asset pointers in `public/assets/frames/`, preloaded and scrubbed on canvas via rAF in `Hero.tsx`; keep the poster fallback and never autoplay media.
