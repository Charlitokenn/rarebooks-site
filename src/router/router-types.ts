import type {LucideIcon} from 'lucide-react'
import React from 'react'

export interface AppRoute {
  id: string
  path: string
  label: string
  icon?: LucideIcon
  element?: React.ComponentType
  showInSidebar?: boolean
  roles?: string[]
  public?: boolean
  children?: AppRoute[]
}

// Shape attached to route handles — consumed by useMatches() in AppShell
export interface RouteHandle {
  label: string
  id: string
}
