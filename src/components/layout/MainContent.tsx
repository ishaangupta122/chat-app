"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, Lock } from "lucide-react";

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      className={cn("flex h-full flex-1 flex-col bg-background", className)}>
      {children}
    </main>
  );
}

// Empty state when no chat is selected
export function EmptyChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <MessageCircle className="h-16 w-16 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-foreground">
        Welcome to ChatApp
      </h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Select a conversation from the sidebar or start a new chat to begin
        messaging.
      </p>
      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-5 w-5" />
        <span>End-to-end encrypted</span>
      </div>
    </div>
  );
}
