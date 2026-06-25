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