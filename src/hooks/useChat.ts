"use client";

import { useState, useCallback, useEffect } from "react";
import { Chat, Message } from "@/types";
import { generateId } from "@/lib/helpers";

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chats (mock data for now)
  useEffect(() => {
    // TODO: Replace with actual API call
    setChats([]);
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      setIsLoading(true);
      // TODO: Replace with actual API call
      setMessages([]);
      setIsLoading(false);
    }
  }, [activeChat]);

  const sendMessage = useCallback(
    (content: string, type: Message["type"] = "text") => {
      if (!activeChat) return;

      const newMessage: Message = {
        id: generateId(),
        chatId: activeChat.id,
        senderId: "current-user", // TODO: Get from auth context
        content,
        type,
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, newMessage]);

      // TODO: Send via socket/API
    },
    [activeChat]
  );

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  return {
    chats,
    activeChat,
    messages,
    isLoading,
    setActiveChat,
    sendMessage,
    addMessage,
    updateMessage,
    deleteMessage,
  };
}
