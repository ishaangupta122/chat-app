"use client";

import { useState, useCallback } from "react";
import { Chat, User, Message } from "@/types";
import { ChatSidebarSection } from "@/sections/ChatSidebarSection";
import { ChatAreaSection } from "@/sections/ChatAreaSection";
import { NewChatSection } from "@/sections/NewChatSection";
import { ChatInfoSection } from "@/sections/ChatInfoSection";
import { SettingsSection } from "@/sections/SettingsSection";
import { cn } from "@/lib/utils";
import {
  currentUser,
  contacts,
  chats as initialChats,
  getMessagesByChatId,
} from "@/data";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChat(chat);
    setIsMobileViewingChat(true);
    // Load messages for this chat from data.ts
    setMessages(getMessagesByChatId(chat.id));
  }, []);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeChat) return;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        chatId: activeChat.id,
        senderId: currentUser.id,
        content,
        type: "text",
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, newMessage]);

      // Simulate message being sent
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
          )
        );
      }, 500);
    },
    [activeChat]
  );

  const handleNewChatSelect = useCallback(
    (contact: User) => {
      // Check if chat exists
      const existingChat = chats.find(
        (chat) =>
          chat.type === "private" &&
          chat.participants.some((p) => p.id === contact.id)
      );

      if (existingChat) {
        handleSelectChat(existingChat);
      } else {
        // Create new chat
        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          type: "private",
          participants: [contact],
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setChats((prev) => [newChat, ...prev]);
        handleSelectChat(newChat);
      }
      setShowNewChat(false);
    },
    [chats, handleSelectChat]
  );

  const handleBack = useCallback(() => {
    setIsMobileViewingChat(false);
  }, []);

  const handleLogout = useCallback(() => {
    console.log("Logging out...");
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "h-full w-full shrink-0 md:w-95 md:block border-r border-border",
          isMobileViewingChat ? "hidden" : "block"
        )}>
        <ChatSidebarSection
          user={currentUser}
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={() => setShowNewChat(true)}
          onSettings={() => setShowSettings(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "h-full flex-1 md:block",
          isMobileViewingChat ? "block" : "hidden md:block"
        )}>
        <ChatAreaSection
          chat={activeChat}
          messages={messages}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onBack={handleBack}
          onViewInfo={() => setShowChatInfo(true)}
        />
      </div>

      {/* Modals */}
      <NewChatSection
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        contacts={contacts}
        onSelectContact={handleNewChatSelect}
      />

      {activeChat && (
        <ChatInfoSection
          isOpen={showChatInfo}
          onClose={() => setShowChatInfo(false)}
          chat={activeChat}
          currentUserId={currentUser.id}
        />
      )}

      <SettingsSection
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
