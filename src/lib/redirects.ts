// The routes /welcome took over from /dashboard (spec 0023 AC-1, AC-9). Pure, so the map is unit tested.
//
// Ready emails sent before the rename link to /dashboard/site/open, so this map must never be removed.

/** `/welcome` and everything under it need a Clerk session; `/welcomefoo` does not match (AC-1). */
export const WELCOME_ROUTE = /^\/welcome(?:\/.*)?$/;

/** 302 until the staging run and one week live pass with no rollback, then 301 (AC-9, build plan step 9). */
export const LEGACY_REDIRECT_STATUS = 302;

/**
 * The new path for an old /dashboard path, or null when the path is not one. Case sensitive, on a whole path
 * segment (`/dashboardx` and `/Dashboard` are not matched), and a trailing slash counts as the same path. It
 * only ever returns a path on this host.
 */
export function legacyTarget(pathname: string): string | null {
  if (pathname !== "/dashboard" && !pathname.startsWith("/dashboard/")) {
    return null;
  }
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return path === "/dashboard/site/open" ? "/welcome/open" : "/welcome";
}
