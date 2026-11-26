// The Docs nav link's `aria-current` on docs pages (spec 0024 AC-3). No imports, so `node --test` runs it as
// it is.

/** `page` on the docs home, `true` on every other docs page, nothing for the other nav links. */
export function docsLinkCurrent(href: string, pathname: string, docsHomePath: string): "page" | "true" | undefined {
  if (href !== docsHomePath) return undefined;
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return withSlash === docsHomePath ? "page" : "true";
}
