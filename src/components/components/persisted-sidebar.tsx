import { SidebarProvider } from "@components/components/ui/sidebar";
import { AppSidebar } from "@components/components/app-sidebar";

export interface PersistedSidebarShellProps {
  path: string;
  user: any;
}

/**
 * Deliberately small and route-agnostic. This is the React island that
 * gets `transition:persist`ed in PortalLayout.astro, so it must not
 * depend on anything that changes per page (breadcrumbs, page content).
 * Active-link highlighting is handled internally by <AppSidebar /> via
 * the `astro:after-swap` event, since props passed in here are frozen
 * after the very first mount.
 */
export function PersistedSidebarShell({
  path,
  user,
}: PersistedSidebarShellProps) {
  return (
    <SidebarProvider wrapperless>
      <AppSidebar path={path} user={user} />
    </SidebarProvider>
  );
}
