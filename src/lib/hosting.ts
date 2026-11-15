/** Resolve the single-page mount without assuming a particular hosting provider. */
export function portfolioBasepath(pathname: string): string {
  return pathname.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
}

type UrlRewrite = { input: (args: { url: URL }) => URL; output: (args: { url: URL }) => URL };

/**
 * Map a static-host mount (e.g. /portfolio) onto the app's "/" routes. Start's client
 * hydration resets `basepath` to its build-time value, but leaves `rewrite` intact.
 */
export function portfolioRewrite(mount: string): UrlRewrite | undefined {
  if (mount === "/") return undefined;
  return {
    input: ({ url }) => {
      if (url.pathname === mount || url.pathname === `${mount}/index.html`) url.pathname = "/";
      else if (url.pathname.startsWith(`${mount}/`)) url.pathname = url.pathname.slice(mount.length);
      return url;
    },
    output: ({ url }) => {
      url.pathname = `${mount}${url.pathname}`.replace(/\/{2,}/g, "/");
      return url;
    },
  };
}
