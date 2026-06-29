import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@components/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@components/components/ui/sidebar";
import { cn } from "@components/lib/utils.ts";

export function NavMain({
  items,
  pathname,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
  }[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Client Portal</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={pathname === item.url}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild />
              <a href={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "cursor-pointer my-0.5",
                    pathname === item.url
                      ? "bg-brand/85 text-brand-soft  font-semibold hover:bg-brand hover:text-brand-soft"
                      : "",
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </a>
              <CollapsibleContent />
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
