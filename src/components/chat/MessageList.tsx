"use client";

import { useRef, useEffect } from "react";
import { Message, User, getDisplayName } from "@/types/client";
import { MessageBubble } from "./MessageBubble";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircleMore } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  participants: User[];
  isLoading?: boolean;
}

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-16 w-64 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageList({
  messages,
  currentUserId,
  participants,
  isLoading,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getParticipant = (userId: string) => {
    return participants.find((p) => p.id === userId);
  };

  if (isLoading) {
    return <MessageSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <MessageCircleMore className="h-8 w-8 text-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">
          No messages yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Start the conversation by sending a message!
        </p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp).toLocaleDateString();
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: messageDate, messages: [message] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col py-4">
        {groupedMessages.map(({ date, messages: dateMessages }) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="sticky top-0 z-10 flex justify-center py-2">
              <span className="rounded-md bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                {date}
              </span>
            </div>

            {/* Messages */}
            {dateMessages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const sender = getParticipant(message.senderId);
              const prevMessage = dateMessages[index - 1];
              const showAvatar =
                !prevMessage || prevMessage.senderId !== message.senderId;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  senderName={sender ? getDisplayName(sender) : undefined}
                  senderAvatar={sender?.avatar ?? undefined}
                />
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
