"use client"

import * as React from "react"

import { NavMain } from "@components/components/nav-main"
import { NavUser } from "@components/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail, useSidebar,
} from "@components/components/ui/sidebar"
import AppLogo from "@components/AppLogo.tsx";
import { Wallet, LayoutDashboard } from "lucide-react";
import {AppConfig} from "../../constants";

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
      icon: <LayoutDashboard/>,
      isActive: true,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: <Wallet/>,
      isActive: false,
    },
  ],
}

interface Props {
  path: string
  user: any
  props: React.ComponentProps<typeof Sidebar>

}

export function AppSidebar({ path, user, ...props } : Props) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="font-bold">
          <AppLogo link="/"/>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} pathname={path} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}