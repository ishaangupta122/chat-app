import { Chat } from "@/types/client";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  // Get display info based on chat type
  const displayName =
    chat.type === "group"
      ? chat.name || "Group"
      : chat.participants[0]?.name || "Unknown";

  const displayAvatar =
    chat.type === "group" ? chat.avatar : chat.participants[0]?.avatar;

  const displayStatus =
    chat.type === "private" ? chat.participants[0]?.status : undefined;

  const lastMessagePreview = chat.lastMessage?.content
    ? chat.lastMessage.content.slice(0, 50) +
      (chat.lastMessage.content.length > 50 ? "..." : "")
    : "No messages yet";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors text-left",
        isActive ? "bg-accent" : "hover:bg-accent/50"
      )}>
      {/* Avatar */}
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

      {/* Chat Info */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "truncate font-medium",
              isActive ? "text-primary" : "text-foreground"
            )}>
            {displayName}
          </span>
          {chat.lastMessage && (
            <span className="text-xs font-medium text-muted-foreground">
              {formatMessageTime(chat.lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="truncate text-sm text-muted-foreground">
            {lastMessagePreview}
          </span>
          {chat.unreadCount > 0 && (
            <Badge className="h-5 min-w-5 rounded-full px-1.5 text-xs">
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
