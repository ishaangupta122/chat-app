"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Chat, User, Message } from "@/types/client";
import { ChatSidebarSection } from "@/sections/ChatSidebarSection";
import { ChatAreaSection } from "@/sections/ChatAreaSection";
import { NewChatSection } from "@/sections/NewChatSection";
import { ChatInfoSection } from "@/sections/ChatInfoSection";
import { SettingsSection } from "@/sections/SettingsSection";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { contacts, chats as initialChats, getMessagesByChatId } from "@/data";
import { toast } from "@/components/ui/toast";

export default function ChatPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);

  // Check for auth toast message from redirect
  useEffect(() => {
    const authToast = sessionStorage.getItem("auth_toast");
    if (authToast) {
      sessionStorage.removeItem("auth_toast");
      try {
        const { type, message } = JSON.parse(authToast);
        if (type === "success") {
          toast.success(message);
        } else if (type === "error") {
          toast.error(message);
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Create a User object from AuthUser for components
  const currentUser: User = user
    ? {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username || "User",
        avatar: user.avatar ?? undefined,
        status: "online",
      }
    : {
        id: "",
        username: "guest",
        displayName: "Guest",
        status: "offline",
      };

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChat(chat);
    setIsMobileViewingChat(true);
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

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

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
