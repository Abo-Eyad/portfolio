import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { portfolioBasepath, portfolioRewrite } from "./lib/hosting";

export const getRouter = () => {
  const rewrite =
    typeof window === "undefined" ? undefined : portfolioRewrite(portfolioBasepath(window.location.pathname));
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // The same static HTML is hosted at / and /portfolio/. Start overrides `basepath` during
    // hydration, so the runtime mount is applied as a URL rewrite instead.
    ...(rewrite ? { rewrite } : {}),
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
  });

  return router;
};
