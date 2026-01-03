export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);

  // Check if same day
  if (
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear()
  ) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  // Check if this week
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (messageDate > weekAgo) {
    return messageDate.toLocaleDateString([], { weekday: "short" });
  }

  // Otherwise return date
  return messageDate.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface CodeBlock {
  language: string;
  code: string;
}

export function extractCodeBlocks(content: string): {
  text: string;
  codeBlocks: CodeBlock[];
} {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: CodeBlock[] = [];
  let text = content;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || "plaintext",
      code: match[2].trim(),
    });
  }

  // Remove code blocks from text
  text = content.replace(codeBlockRegex, "").trim();

  return { text, codeBlocks };
}
