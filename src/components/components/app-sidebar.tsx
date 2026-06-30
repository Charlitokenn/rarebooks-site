"use client";

import * as React from "react";

import { NavMain } from "@components/components/nav-main";
import { NavUser } from "@components/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@components/components/ui/sidebar";
import AppLogo from "@components/AppLogo.tsx";
import { Wallet, LayoutDashboard } from "lucide-react";
import { AppConfig } from "../../constants";
import { TooltipProvider } from "@components/components/ui/tooltip";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      isActive: true,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: <Wallet />,
      isActive: false,
    },
  ],
};

interface Props extends React.ComponentProps<typeof Sidebar> {
  path: string;
  user: any;
}

export function AppSidebar({ path, user, ...props }: Props) {
  // This island is `transition:persist`ed across dashboard navigations,
  // which means it is NOT remounted (or re-rendered with new props) when
  // the route changes — `path` is only correct on the very first load.
  // Track the live pathname ourselves so the active nav item still
  // updates after client-side navigations.
  const [pathname, setPathname] = React.useState(path);

  React.useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    document.addEventListener("astro:after-swap", updatePathname);
    return () =>
      document.removeEventListener("astro:after-swap", updatePathname);
  }, []);

  return (
      <TooltipProvider>
        <Sidebar collapsible="icon" {...props}>
          <SidebarHeader className="font-bold">
            <AppLogo link="/" />
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={data.navMain} pathname={pathname} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser userDetails={user} />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
      </TooltipProvider>
  );
}
