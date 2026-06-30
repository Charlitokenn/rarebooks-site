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
import {signOutUser} from "@components/lib/sign-out.ts";
import {useState} from "react";

export function NavUser({ userDetails }: { userDetails: any }) {
  const { isMobile } = useSidebar();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      // Clerk's redirect navigates the page away, so there's normally
      // nothing left to reset isSigningOut for — but if sign-out fails
      // (e.g. Clerk not loaded), let the user try again.
      await signOutUser("/");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
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
            <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleSignOut}
            >
                <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
                Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
