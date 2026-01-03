"use client";

import { Chat } from "@/types/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BellOff,
  ChevronLeft,
  CircleAlert,
  EllipsisVertical,
  Search,
  Trash2,
} from "lucide-react";

interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
  onViewInfo?: () => void;
}

export function ChatHeader({ chat, onBack, onViewInfo }: ChatHeaderProps) {
  const displayName =
    chat.type === "group"
      ? chat.name || "Group"
      : chat.participants[0]?.name || "Unknown";

  const displayAvatar =
    chat.type === "group" ? chat.avatar : chat.participants[0]?.avatar;

  const displayStatus =
    chat.type === "private" ? chat.participants[0]?.status : undefined;

  const statusText =
    displayStatus === "online"
      ? "Online"
      : displayStatus === "away"
      ? "Away"
      : chat.type === "group"
      ? `${chat.participants.length} members`
      : "Offline";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Back Button (mobile) */}
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Avatar */}
        <button
          onClick={onViewInfo}
          className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={displayAvatar}
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            {displayStatus === "online" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
            )}
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{statusText}</p>
          </div>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="h-7 w-7" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewInfo?.()}>
              <CircleAlert className="mr-2 h-7 w-7" />
              View Info
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Search className="mr-2 h-4 w-4" />
              Search
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BellOff className="mr-2 h-4 w-4" />
              Mute Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
