import React from 'react'
import { SidebarProvider } from "@components/components/ui/sidebar";
import {AppSidebar} from "@components/components/app-sidebar.tsx";
import { TooltipProvider } from "@components/components/ui/tooltip";

export const ClientPortalShell = () => {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
        </TooltipProvider>
    )
}

