import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from './ui/collapsible.tsx'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from './ui/sidebar'
import { ChevronRightIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import type {AppRoute} from "../../types/global";

export function NavMain({ items }: { items: AppRoute[] }): React.ReactElement {
  const location = useLocation()

  // Auto-open the collapsible whose child path matches the current URL.
  // Falls back to null (all collapsed) if no match.
  const [openItem, setOpenItem] = useState<string | null>(() => {
    const active = items.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(`${item.path}/${child.path}`))
    )
    return active?.id ?? null
  })

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.children?.length

          // ── Leaf route ──────────────────────────────────────────────────────
          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.id}>
                <NavLink to={item.path} end>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive}
                      className="cursor-pointer"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            )
          }

          // ── Parent route (collapsible) ──────────────────────────────────────
          // Parent button is highlighted when any child is active
          const isParentActive = item.children!.some((child) =>
            location.pathname.startsWith(`${item.path}/${child.path}`)
          )

          return (
            <Collapsible
              key={item.id}
              open={openItem === item.id}
              onOpenChange={(isOpen) => setOpenItem(isOpen ? item.id : null)}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={isParentActive && openItem !== item.id}
                  />
                }
              >
                {item.icon && <item.icon />}
                <span>{item.label}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.children!.map((child) => (
                    <SidebarMenuSubItem key={child.id}>
                      <NavLink to={`${item.path}/${child.path}`} end>
                        {({ isActive }) => (
                          <SidebarMenuSubButton isActive={isActive}>
                            {child.icon && <child.icon className="size-4" />}
                            <span>{child.label}</span>
                          </SidebarMenuSubButton>
                        )}
                      </NavLink>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
