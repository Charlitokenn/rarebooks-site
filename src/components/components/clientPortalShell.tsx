import React from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@components/components/ui/sidebar";
import { AppSidebar } from "@components/components/app-sidebar.tsx";
import { TooltipProvider } from "@components/components/ui/tooltip";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@components/components/ui/breadcrumb.tsx";
import { Home } from "lucide-react";
import { Separator } from "@components/components/ui/separator.tsx";

export interface Crumb {
    label: string
    href?: string
}

export const ClientPortalShell = ({
                                      children,
                                      breadcrumbs = [],
                                      path,
                                      userDetails
                                  }: {
    children: React.ReactNode
    path: string
    userDetails: any
    breadcrumbs?: Crumb[]
}) => {

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar path={path} user={userDetails} />
                <SidebarInset>
                    <header className="flex h-12 shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex w-full items-center justify-between pr-5 border-b border-b-muted py-2">
                            <div className="flex items-center gap-2 px-4">
                                {/*TODO: Trigger not working on the sidebar*/}
                                <SidebarTrigger className="-ml-1 bg-muted text-brand-soft cursor-pointer" />
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 mt-1 data-[orientation=vertical]:h-4"
                                />
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        {/* Home — always links to / */}
                                        <BreadcrumbItem>
                                            <BreadcrumbLink asChild>
                                                <a href="/" aria-label="Home">
                                                    <Home className="size-4" />
                                                </a>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>

                                        {/* Dynamic crumbs passed from the page */}
                                        {breadcrumbs.map((crumb, i, arr) => {
                                            const isLast = i === arr.length - 1
                                            return (
                                                <React.Fragment key={i}>
                                                    <BreadcrumbSeparator />
                                                    <BreadcrumbItem>
                                                        {isLast ? (
                                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                                        ) : (
                                                            <BreadcrumbLink asChild>
                                                                <a href={crumb.href}>{crumb.label}</a>
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
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-auto p-4">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    )
}