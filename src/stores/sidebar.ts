import { atom } from "nanostores";

/**
 * The persisted <AppSidebar /> island and the per-page <DashboardHeader />
 * island live in two separate React roots (so the header — and its
 * breadcrumbs — can re-render on every navigation while the sidebar does
 * not). React Context can't cross that boundary, so we use a tiny nanostore
 * as an event bus instead: the header "pings" this signal, and the
 * persisted sidebar listens for pings and toggles its own internal state.
 *
 * This intentionally does NOT mirror the open/closed boolean itself —
 * the sidebar remains the single source of truth for its own state
 * (including the persistence cookie). The store is just a doorbell.
 */
export const $sidebarToggleSignal = atom(0);

export function requestSidebarToggle() {
  $sidebarToggleSignal.set($sidebarToggleSignal.get() + 1);
}
