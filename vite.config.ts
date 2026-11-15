// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { ConfigEnv } from "vite";

// Nitro's own options (including alias) pass through; the wrapper's type lists only a subset.
const nitroOptions = {
  // The prerender bridge calls the Nitro entry's default.fetch. `standard`
  // exports it without listening on a port; `node-server` starts a listener
  // and exports {}, which fails prerender and keeps the build process alive.
  // Only public output is retained by scripts/prepare-static.mjs.
  preset: "standard",
  output: { dir: ".output", publicDir: ".output/public", serverDir: ".output/server" },
  // The standard preset aliases bare `srvx` to `srvx/generic` by prefix, which turns
  // h3's `srvx/body-limit` import into `.../adapters/generic.mjs/body-limit`. A more
  // specific alias keeps the explicit package export, like the preset does for srvx/node.
  alias: { "srvx/body-limit": "srvx/body-limit" },
};

export default (environment: ConfigEnv) => defineConfig({
  // Relative URLs are for exported builds; the dev module server needs an absolute base.
  vite: { base: environment.command === "build" ? "./" : "/" },
  nitro: nitroOptions,
  tanstackStart: {
    router: { basepath: "/" },
    pages: [{ path: "/" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false },
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
})(environment);
