"use client";

interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing`;
    } else {
      return `${users[0]} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span>{getText()}</span>
    </div>
  );
}
