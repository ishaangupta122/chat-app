"use client";

import {
  useState,
  useRef,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, SendHorizonal, Smile } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [message, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      onTyping?.();

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    },
    [onTyping]
  );

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Files selected:", files);
    }
  }, []);

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFileClick}
          disabled={disabled}
          className="shrink-0 text-muted-foreground hover:text-foreground">
          <Paperclip />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={disabled}
          className="shrink-0 text-muted-foreground hover:text-foreground">
          <Smile />
        </Button>

        {/* Text Input */}
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "min-h-10 resize-none rounded-2xl border-0 bg-muted px-4 py-2.5 font-medium focus-visible:ring-1",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />
        </div>

        {/* Send Button */}
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className="shrink-0 rounded-full">
          <SendHorizonal />
        </Button>
      </div>
    </div>
  );
}
