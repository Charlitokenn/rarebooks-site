import { atom } from "nanostores";

export const SIDEBAR_COOKIE_NAME = "sidebar_state";

/**
 * The persisted <AppSidebar /> island and the per-page <DashboardHeader />
 * / <main> markup live in two separate React roots / hydration boundaries
 * (so the header — and its breadcrumbs — can re-render on every navigation
 * while the sidebar does not). React Context can't cross that boundary, and
 * Astro wraps each `client:*` component in its own <astro-island>, which
 * also breaks Tailwind's `peer`/`peer-data-*` selectors (they require true
 * DOM siblings). We use nanostores instead — Astro's documented pattern for
 * sharing state between independent islands.
 */

// Doorbell: the header's trigger button "pings" this, and the persisted
// sidebar listens for pings and toggles its own internal open state.
// The sidebar remains the single source of truth for *whether* it's open.
export const $sidebarToggleSignal = atom(0);

export function requestSidebarToggle() {
  $sidebarToggleSignal.set($sidebarToggleSignal.get() + 1);
}

// Mirror of the sidebar's open/collapsed state, written by SidebarProvider
// whenever it changes. Anything that needs to react to collapse state
// outside the sidebar's own React root (e.g. plain Astro markup) should
// read this instead of relying on peer-data-[...] CSS.
export const $sidebarOpen = atom<boolean>(true);
