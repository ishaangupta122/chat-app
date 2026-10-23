"use client";

import { useState, useCallback } from "react";
import { Chat, Message, User, getDisplayName } from "@/types/client";
import { MainContent, EmptyChat } from "@/components/layout/MainContent";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";

interface ChatAreaSectionProps {
  chat: Chat | null;
  messages: Message[];
  currentUser: User;
  typingUsers?: string[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  onViewInfo?: () => void;
  isLoading?: boolean;
}

export function ChatAreaSection({
  chat,
  messages,
  currentUser,
  typingUsers = [],
  onSendMessage,
  onBack,
  onViewInfo,
  isLoading,
}: ChatAreaSectionProps) {
  const [isTyping, setIsTyping] = useState(false);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  }, [isTyping]);

  if (!chat) {
    return (
      <MainContent>
        <EmptyChat />
      </MainContent>
    );
  }

  return (
    <MainContent>
      <ChatHeader chat={chat} onBack={onBack} onViewInfo={onViewInfo} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden chat-bg-pattern">
        <MessageList
          messages={messages}
          currentUserId={currentUser.id}
          participants={chat.participants}
          isLoading={isLoading}
        />

        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
      </div>

      <MessageInput
        onSend={onSendMessage}
        onTyping={handleTyping}
        placeholder={`Message ${
          chat.type === "group"
            ? chat.name
            : chat.participants[0]
            ? getDisplayName(chat.participants[0])
            : "Unknown"
        }`}
      />
    </MainContent>
  );
}
