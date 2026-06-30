import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@components/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@components/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UnfoldMoreIcon,
  LogoutIcon,
} from "@hugeicons/core-free-icons";
import {GetInitials} from "@components/lib/utils.ts";

export function NavUser({ userDetails }: { userDetails: any }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userDetails.imageUrl} alt={userDetails.id} />
                <AvatarFallback className="rounded-lg">{GetInitials(userDetails.firstName, userDetails.lastName)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {userDetails.firstName} {userDetails.lastName}
                </span>
                <span className="truncate text-xs">
                  {userDetails.emailAddresses[0].emailAddress}
                </span>
              </div>
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                strokeWidth={2}
                className="ml-auto size-4"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userDetails.imageUrl} alt={userDetails.firstName} />
                  <AvatarFallback className="rounded-lg">{GetInitials(userDetails.firstName, userDetails.lastName)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userDetails.firstName} {userDetails.lastName}</span>
                  <span className="truncate text-xs">{userDetails.emailAddresses[0]}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log("signed out")}>
                <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
                Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
