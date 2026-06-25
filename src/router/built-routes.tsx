import { RouteObject, Navigate } from 'react-router-dom'
import { AppRoute } from './router-types'

/**
 * Converts AppRoute[] into React Router RouteObject[].
 *
 * Option A: sidebar collapsible is the only sub-nav.
 * Parent routes have NO layout wrapper — children render directly
 * into AppShell's <Outlet />, same as leaf routes.
 *
 * Parent with children  → index redirects to first child (or renders
 *                          parent's element if provided)
 *                          children render their element directly
 *
 * Leaf route            → element rendered directly
 *
 * Each route attaches a `handle` so useMatches() builds breadcrumbs
 * without any prop drilling or manual label maps.
 */
export function buildRoutes(routes: AppRoute[]): RouteObject[] {
  return routes.map((route): RouteObject => {
    const handle = { label: route.label, id: route.id }

    // ── Leaf route ────────────────────────────────────────────────────────────
    if (!route.children?.length) {
      return {
        path: route.path,
        element: route.element ? <route.element /> : null,
        handle
      }
    }

    // ── Parent route (has children) ───────────────────────────────────────────
    // No layout wrapper — AppShell <Outlet /> renders the matched child directly.
    const indexRoute: RouteObject = route.element
      ? { index: true, element: <route.element />, handle }
      : {
          index: true,
          element: <Navigate to={`${route.path}/${route.children[0].path}`} replace />
        }

    const childRoutes: RouteObject[] = route.children.map((child) => ({
      path: child.path,
      element: child.element ? <child.element /> : null,
      handle: { label: child.label, id: child.id }
    }))

    return {
      path: route.path,
      handle,
      children: [indexRoute, ...childRoutes]
    }
  })
}
