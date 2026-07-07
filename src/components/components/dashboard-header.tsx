import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@components/components/ui/breadcrumb";
import { Separator } from "@components/components/ui/separator";
import { Button } from "@components/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { Home } from "lucide-react";
import { requestSidebarToggle } from "../../stores/sidebar";
import { ClerkUserButton } from "./clerk-user-button";

export interface Crumb {
  label: string;
  href?: string;
}

export function DashboardHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: Crumb[];
}) {
  return (
    <header className="flex h-12 shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center justify-between pr-5 border-b border-b-muted py-2">
        <div className="flex items-center gap-2 px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-1 bg-muted text-brand-soft cursor-pointer"
            onClick={() => requestSidebarToggle()}
          >
            <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
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
                const isLast = i === arr.length - 1;
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
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center justify-center">
          <ClerkUserButton />
        </div>
      </div>
    </header>
  );
}
