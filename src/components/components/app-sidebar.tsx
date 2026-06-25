import * as React from 'react'

// import { NavMain } from './nav-main.tsx'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar
} from "./ui/sidebar.tsx"
import { useEffect, useMemo, useState } from 'react'
import AppLogo from "@components/AppLogo.tsx";
import {AppConfig} from "../../constants";
import type {AppRoute} from "../../types/global";
import {LaptopIcon, LayoutDashboard, WalletIcon} from "lucide-react";

export const ROUTES = {
    dashboard: '/',
    billing: '/billing',
    devices: '/devices',
} as const

export const APP_ROUTES: AppRoute[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: ROUTES.dashboard,
        icon: LayoutDashboard,
        showInSidebar: true,
    },
    {
        id: 'devices',
        label: 'My Devices',
        path: ROUTES.devices,
        icon: LaptopIcon,
        showInSidebar: true,
    },
    {
        id: 'billing',
        label: 'Billing',
        path: ROUTES.billing,
        icon: WalletIcon,
        showInSidebar: true,
    },
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { state } = useSidebar()
    const isCollapsed = state === 'collapsed'
    const [showText, setShowText] = useState(state === 'expanded')

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>

        if (state === 'expanded') {
            // wait for sidebar animation to finish before showing text
            timer = setTimeout(() => setShowText(true), 200)
        } else {
            // defer to next tick instead of calling synchronously
            timer = setTimeout(() => setShowText(false), 0)
        }

        return () => clearTimeout(timer)
    }, [state])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div
                    onClick={(e) => isCollapsed && e.stopPropagation()}
                    style={{ pointerEvents: isCollapsed ? 'none' : 'auto' }}
                >
                    <AppLogo link={AppConfig.rootUrl}/>
                </div>
            </SidebarHeader>
            <SidebarContent>
                {/*<NavMain items={APP_ROUTES} />*/}
            </SidebarContent>
            <SidebarFooter/>
            <SidebarRail />
        </Sidebar>
    )
}
