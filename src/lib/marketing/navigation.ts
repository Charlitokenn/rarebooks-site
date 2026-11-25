// Server side helpers for MkNav and MkFooter (spec 0018). Kept out of the components so node tests can
// cover them without rendering Astro.
import type { FooterColumn } from "../../constants/navigation.ts";

interface AuthLocals {
  auth?: () => { isAuthenticated?: boolean } | null | undefined;
}

/**
 * Whether the visitor is signed in, from the Clerk session `clerkMiddleware` put on `locals` (AC-4). A
 * missing `auth`, or one that throws, counts as signed out, so the page still renders.
 */
export function isSignedIn(locals: AuthLocals | undefined): boolean {
  try {
    return locals?.auth?.()?.isAuthenticated === true;
  } catch {
    return false;
  }
}

/** The Compare link's `aria-current` (AC-7): `page` on /compare, `true` below it, nothing elsewhere. */
export function compareCurrent(pathname: string): "page" | "true" | undefined {
  if (pathname === "/compare" || pathname === "/compare/") return "page";
  if (pathname.startsWith("/compare/")) return "true";
  return undefined;
}

/** The footer columns this visitor sees: links filtered by sign in state, Legal only once approved. */
export function visibleFooterColumns(
  columns: FooterColumn[],
  signedIn: boolean,
  legalApproved: boolean,
): FooterColumn[] {
  return columns
    .filter((column) => !column.legal || legalApproved)
    .map((column) => ({
      ...column,
      links: column.links.filter(
        (link) => !link.auth || link.auth === (signedIn ? "signed-in" : "signed-out"),
      ),
    }));
}
