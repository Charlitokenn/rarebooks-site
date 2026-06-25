import React from 'react'
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@components/components/ui/sidebar";
import {AppSidebar} from "@components/components/app-sidebar.tsx";
import { TooltipProvider } from "@components/components/ui/tooltip";
import { Link, Outlet, useMatches } from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from "@components/components/ui/breadcrumb.tsx";
import { Home } from "lucide-react";
import { UserButton } from "@clerk/astro/components";
import {Separator} from "@components/components/ui/separator.tsx";

export const ClientPortalShell = () => {
    const matches = useMatches() as Array<{ id: string; pathname: string; handle: RouteHandle }>
    const crumbs = matches.filter((m) => m.handle?.label)

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <header className="flex h-12 shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                            <div className="flex w-full items-center justify-between pr-5 border-b py-2">
                                <div className="flex items-center gap-2 px-4 ">
                                    <SidebarTrigger className="-ml-1 bg-muted cursor-pointer" />
                                    <Separator
                                        orientation="vertical"
                                        className="mr-2 mt-1 data-[orientation=vertical]:h-4"
                                    />
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            {/* Home icon — always present, links back to / */}
                                            <BreadcrumbItem>
                                                <BreadcrumbLink asChild>
                                                    <Link to="/" aria-label="Home">
                                                        <Home className="size-4" />
                                                    </Link>
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>

                                            {/* Dynamic crumbs — skips the root / match */}
                                            {crumbs
                                                .filter((crumb) => crumb.pathname !== '/')
                                                .map((crumb, i, arr) => {
                                                    const isLast = i === arr.length - 1
                                                    return (
                                                        <React.Fragment key={crumb.id}>
                                                            <BreadcrumbSeparator />
                                                            <BreadcrumbItem>
                                                                {isLast ? (
                                                                    <BreadcrumbPage>{crumb.handle.label}</BreadcrumbPage>
                                                                ) : (
                                                                    <BreadcrumbLink asChild>
                                                                        <Link to={crumb.pathname}>{crumb.handle.label}</Link>
                                                                    </BreadcrumbLink>
                                                                )}
                                                            </BreadcrumbItem>
                                                        </React.Fragment>
                                                    )
                                                })}
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>
                                <div className="flex items-center justify-center">
                                    <UserButton />
                                </div>
                            </div>
                        </header>

                        <main className="flex-1 overflow-auto p-4">
                            <Outlet />
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </SidebarProvider>
        </TooltipProvider>
    )
}