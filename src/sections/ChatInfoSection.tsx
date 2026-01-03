"use client";

import { Chat } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, LogOut, Trash2 } from "lucide-react";

interface ChatInfoSectionProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
  currentUserId: string;
  onLeaveGroup?: () => void;
  onDeleteChat?: () => void;
}

export function ChatInfoSection({
  isOpen,
  onClose,
  chat,
  currentUserId,
  onLeaveGroup,
  onDeleteChat,
}: ChatInfoSectionProps) {
  const isGroup = chat.type === "group";
  const displayName = isGroup
    ? chat.name || "Group"
    : chat.participants[0]?.name || "Unknown";
  const displayAvatar = isGroup ? chat.avatar : chat.participants[0]?.avatar;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Info</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Profile/Group Info */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              {!isGroup && chat.participants[0]?.status === "online" && (
                <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-background bg-emerald-500" />
              )}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {displayName}
            </h3>
            {!isGroup && chat.participants[0]?.email && (
              <p className="text-sm text-muted-foreground">
                {chat.participants[0].email}
              </p>
            )}
            {isGroup && (
              <p className="text-sm text-muted-foreground">
                {chat.participants.length} members
              </p>
            )}
          </div>

          {/* Members (for groups) */}
          {isGroup && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-foreground">
                Members
              </h4>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {chat.participants.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg p-2">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        {member.status === "online" && (
                          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background bg-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {member.name}
                          {member.id === currentUserId && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (You)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-accent">
              <span className="text-sm text-foreground">
                Media, Links, and Docs
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-accent">
              <span className="text-sm text-foreground">Starred Messages</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-accent">
              <span className="text-sm text-foreground">
                Mute Notifications
              </span>
              <div className="h-5 w-9 rounded-full bg-muted" />
            </button>
          </div>

          {/* Danger Zone */}
          <div className="space-y-2">
            <Separator />
            <div className="pt-2 space-y-2">
              {isGroup && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={onLeaveGroup}>
                  <LogOut className="mr-2 h-5 w-5" />
                  Exit Group
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDeleteChat}>
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Chat
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
