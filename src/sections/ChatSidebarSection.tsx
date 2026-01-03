"use client";

import { Chat, User } from "@/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarHeader } from "@/components/layout/SidebarHeader";
import { ChatList } from "@/components/chat/ChatList";

interface ChatSidebarSectionProps {
  user: User;
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onSettings: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

export function ChatSidebarSection({
  user,
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onSettings,
  onLogout,
  isLoading,
}: ChatSidebarSectionProps) {
  return (
    <Sidebar>
      <SidebarHeader
        user={{
          name: user.name,
          avatar: user.avatar,
          status: user.status,
        }}
        onNewChat={onNewChat}
        onSettings={onSettings}
        onLogout={onLogout}
      />
      <ChatList
        chats={chats}
        activeChat={activeChat}
        onSelectChat={onSelectChat}
        isLoading={isLoading}
      />
    </Sidebar>
  );
}
