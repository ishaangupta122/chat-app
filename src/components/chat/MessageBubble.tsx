import { Message } from "@/types/client";
import { cn } from "@/lib/utils";
import { formatMessageTime, extractCodeBlocks } from "@/lib/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CodeBlock } from "./CodeBlock";
import { Circle, Check, CheckCheck, FileText } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  senderName,
  senderAvatar,
}: MessageBubbleProps) {
  const { text, codeBlocks } = extractCodeBlocks(message.content);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStatus = () => {
    if (!isOwn) return null;

    const statusIcons = {
      sending: (
        <Circle className="h-3 w-3 fill-muted-foreground text-muted-foreground" />
      ),
      sent: <Check className="h-4 w-4 text-muted-foreground" />,
      delivered: <CheckCheck className="h-4 w-4 text-muted-foreground" />,
      read: <CheckCheck className="h-4 w-4 text-sky-500" />,
    };

    return statusIcons[message.status];
  };

  return (
    <div
      className={cn(
        "flex gap-2 px-4 py-1",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="mt-1 h-8 w-8 shrink-0">
          <AvatarImage src={senderAvatar} alt={senderName || "User"} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            {getInitials(senderName || "You")}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex max-w-[70%] flex-col",
          isOwn ? "items-end" : "items-start"
        )}>
        {/* Sender Name (for group chats) */}
        {!isOwn && senderName && (
          <span className="mb-1 text-sm font-medium text-primary">
            {senderName}
          </span>
        )}

        {/* Text Content */}
        {text && (
          <div
            className={cn(
              "rounded-2xl p-4 text-sm font-medium",
              isOwn
                ? "bg-primary/80 text-primary-foreground rounded-br-none"
                : "bg-muted text-foreground rounded-bl-none"
            )}>
            <p className="whitespace-pre-wrap break-all">{text}</p>
          </div>
        )}

        {/* Code Blocks */}
        {codeBlocks.map((block, index) => (
          <CodeBlock
            key={index}
            code={block.code}
            language={block.language}
            className="mt-4 w-full max-w-lg"
          />
        ))}

        {/* Attachments */}
        {message.attachments?.map((attachment) => (
          <div
            key={attachment.id}
            className="mt-2 flex items-center gap-2 rounded-lg bg-muted p-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {attachment.name}
              </p>
            </div>
          </div>
        ))}

        {/* Time and Status */}
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <span>{formatMessageTime(message.timestamp)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}
