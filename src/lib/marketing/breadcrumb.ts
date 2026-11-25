// The BreadcrumbList structured data for the comparison detail pages (spec 0021 AC-8). No imports, so
// `node --test` runs it.

export type BreadcrumbSection = "compare" | "alternatives";

const sectionNames: Record<BreadcrumbSection, string> = { compare: "Compare", alternatives: "Alternatives" };

/**
 * Home, the section index, then the page itself, matching the visible breadcrumb. `rootUrl` is
 * `AppConfig.urls.rootUrl`; `name` is "RareBooks vs Xero" or "Xero alternative".
 */
export function breadcrumbJsonLd(rootUrl: string, section: BreadcrumbSection, slug: string, name: string): object {
  const url = (path: string) => new URL(path, rootUrl).toString();
  const items = [
    { name: "Home", item: url("/") },
    { name: sectionNames[section], item: url(`/${section}`) },
    { name, item: url(`/${section}/${slug}`) },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({ "@type": "ListItem", position: index + 1, ...entry })),
  };
}
