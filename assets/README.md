# Portfolio illustrations

Terrain supports the hero's portrait and experience stats. Relay accompanies
Tools & Automation. Both are abstract illustrations, with pointer interaction
and no autoplay. Reduced-motion users see static figures.

The English and Arabic pages load `hairline.css` and `hairline.bundle.js` from
their embedded `__bundler/template`, after the page unpacks. Keep these assets
alongside both HTML files when deploying to GitHub Pages. No CDN or server-side
Node process is required.

To regenerate the shared bundle after changing `hairline.js`:

```sh
npm ci
npm run build:hairline
```

The checked-in bundle contains only Terrain, Relay and their shared engine.
Hairline 0.5.1 is MIT licensed; its notice is in `hairline.LICENSE`.

Browser verification (Python Playwright and its Chromium browser required):

```sh
python tests/test_hairline.py
```

The check serves the repository temporarily, verifies both languages at desktop
and mobile widths, checks pointer interaction and reduced motion, and verifies
that illustration download failure does not block the portfolio content.
