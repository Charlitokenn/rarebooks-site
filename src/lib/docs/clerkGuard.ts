// Keeps Clerk off the docs pages (spec 0024 AC-11). `@clerk/astro` injects one "page" script into every page
// Astro builds, docs included, and that script loads Clerk's browser script from Clerk's CDN. The docs need no
// session, so `astro.config.mjs` points that script's `@clerk/astro/internal` import at this file instead.
// Here Clerk's code is loaded with a dynamic import only on pages that are not docs pages, so a docs page
// fetches no Clerk code at all, and every other page starts Clerk as before (one chunk later).
//
// The two exports mirror the two names the injected script imports from `@clerk/astro/internal`.

/** The meta tag DocsHead writes on every docs page. */
export const DOCS_PAGE_META = "rarebooks-page";

type ClerkInternal = typeof import("@clerk/astro/internal");

let clerk: ClerkInternal | undefined;

function isDocsPage(): boolean {
  return document.querySelector(`meta[name="${DOCS_PAGE_META}"][content="docs"]`) !== null;
}

export async function runInjectionScript(
  ...args: Parameters<ClerkInternal["runInjectionScript"]>
): Promise<void> {
  if (isDocsPage()) return;
  clerk ??= await import("@clerk/astro/internal");
  await clerk.runInjectionScript(...args);
}

/**
 * Only called during an Astro view transition (the site uses none today). Once Clerk is loaded it does its own
 * swap, which keeps Clerk's styles; before that (a docs page) there is nothing of Clerk's to keep, so it does
 * Astro's plain swap.
 */
export function swapDocument(...args: Parameters<ClerkInternal["swapDocument"]>): void {
  if (clerk) {
    clerk.swapDocument(...args);
    return;
  }
  const [swap, doc] = args;
  swap.deselectScripts(doc);
  swap.swapRootAttributes(doc);
  swap.swapHeadElements(doc);
  const restoreFocus = swap.saveFocus();
  swap.swapBodyElement(doc.body, document.body);
  restoreFocus();
}
