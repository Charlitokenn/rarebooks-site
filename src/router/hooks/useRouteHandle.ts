import { useMatches } from 'react-router-dom'
import type {RouteHandle} from '../router-types.ts'

/**
 * Returns the handle of the deepest matched route —
 * i.e. the currently active page's label, id, etc.
 */
export function useRouteHandle(): RouteHandle {
  const matches = useMatches() as Array<{ handle: RouteHandle }>
  const withHandle = matches.filter((m) => m.handle?.label)

  return withHandle[withHandle.length - 1]?.handle ?? { label: '', id: '' }
}
