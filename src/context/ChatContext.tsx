"use client";

import { createContext, useContext, ReactNode } from "react";
import { ChatContextType } from "@/types";
import { useChat } from "@/hooks/useChat";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const chatState = useChat();

  return (
    <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
