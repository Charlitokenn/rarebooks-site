// Competitors dropped from the comparison list (spec 0021 AC-10). No imports, so `astro.config.mjs` and
// `node --test` can both load it as it is.

/**
 * Each dropped slug and the slug in `competitors` its old URLs move to, or `null` to send them to the index
 * page. Filled in build step 5, once the AC-1 checks settle the list; a mapping is kept only when research
 * drops the old product and keeps its successor.
 */
export const retiredCompetitors: Record<string, string | null> = {};

/** The nine old `/blog/rarebooks-vs-*` posts, each now a comparison page or a redirect to one. */
export const blogSlugs = [
  "gnucash",
  "busy-accounting",
  "manager-io",
  "quickbooks-desktop",
  "reach-accountant",
  "sage-50",
  "tallyprime",
  "turbocash",
  "wings-accounting",
] as const;

/** The final `/compare` address for an old slug: itself, its successor, or the index (AC-10). */
export function compareTarget(slug: string, retired: Record<string, string | null>): string {
  if (!(slug in retired)) return `/compare/${slug}`;
  const successor = retired[slug];
  return successor === null ? "/compare" : `/compare/${successor}`;
}

/**
 * The `/blog/rarebooks-vs-<slug>` redirects for `astro.config.mjs`, each pointing straight at the final
 * address, so an old link lands in one hop and never on a retired URL (AC-10).
 */
export function blogRedirects(retired: Record<string, string | null>): Record<string, string> {
  return Object.fromEntries(blogSlugs.map((slug) => [`/blog/rarebooks-vs-${slug}`, compareTarget(slug, retired)]));
}
