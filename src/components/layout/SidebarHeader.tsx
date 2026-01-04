"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import {
  MessageCirclePlus,
  MoreVertical,
  Users,
  Star,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

interface SidebarHeaderProps {
  user: {
    name: string;
    avatar?: string;
    status: "online" | "offline" | "away";
  };
  onNewChat?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function SidebarHeader({
  user,
  onNewChat,
  onSettings,
  onLogout,
}: SidebarHeaderProps) {
  const { theme, setTheme } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {user.status === "online" && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          )}
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {user.name}
          </h2>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onNewChat}>
          <MessageCirclePlus className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              New Group
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Star className="mr-2 h-4 w-4" />
              Starred Messages
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onSettings?.()}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={() => onLogout?.()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
