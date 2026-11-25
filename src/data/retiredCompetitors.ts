// Competitors dropped from the comparison list (spec 0021 AC-10). No imports, so `astro.config.mjs` and
// `node --test` can both load it as it is.

/**
 * Each dropped slug and the slug in `competitors` its old URLs move to, or `null` to send them to the index
 * page. Each outcome, and the vendor page behind it, is recorded in spec 0021's verify.md (AC-1, checked
 * 2026-11-25). A 301 is cached hard by browsers and search engines, so check a change here before deploying.
 */
export const retiredCompetitors: Record<string, string | null> = {
  // Desktop only: the cloud options run the desktop program on a hosted or remote computer.
  "busy-accounting": null,
  gnucash: null,
  "quickbooks-desktop": "quickbooks",
  "sage-50": "sage",
  tallyprime: null,
  turbocash: null,
  // No vendor site left to check (your decision, 2026-11-25).
  "reach-accountant": null,
  "wings-accounting": null,
};

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

/**
 * Where an old `/<section>/<slug>` URL goes: its successor's page, or the section index when the successor is
 * `null` (AC-10). `undefined` when the slug isn't retired.
 */
export function retiredTarget(
  section: "compare" | "alternatives",
  slug: string,
  retired: Record<string, string | null> = retiredCompetitors,
): string | undefined {
  if (!Object.hasOwn(retired, slug)) return undefined;
  const successor = retired[slug];
  return successor === null ? `/${section}` : `/${section}/${successor}`;
}

/** The final `/compare` address for an old slug: itself, its successor, or the index (AC-10). */
export function compareTarget(slug: string, retired: Record<string, string | null>): string {
  return retiredTarget("compare", slug, retired) ?? `/compare/${slug}`;
}

/**
 * The `/blog/rarebooks-vs-<slug>` redirects for `astro.config.mjs`, each pointing straight at the final
 * address, so an old link lands in one hop and never on a retired URL (AC-10).
 */
export function blogRedirects(retired: Record<string, string | null>): Record<string, string> {
  return Object.fromEntries(blogSlugs.map((slug) => [`/blog/rarebooks-vs-${slug}`, compareTarget(slug, retired)]));
}
