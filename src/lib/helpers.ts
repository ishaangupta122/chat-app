import { AxiosError } from "axios";

export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * User-friendly error messages for auth operations
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Error codes from server
  INVALID_CREDENTIALS: "The email or password you entered is incorrect.",
  EMAIL_EXISTS: "This email is already registered. Try logging in instead.",
  WEAK_PASSWORD: "Please choose a stronger password.",
  INVALID_TOKEN: "Your session has expired. Please sign in again.",
  PROVIDER_ERROR: "Unable to sign in with Google. Please try again.",
};

/**
 * Get user-friendly message for auth errors
 */
export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && error.response?.data) {
    const { code, error: message } = error.response.data;

    // First check if we have a mapped message for the error code
    if (code && AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }

    // For weak password, the server sends the specific requirement
    if (code === "WEAK_PASSWORD" && message) {
      return message;
    }

    // If server sent a message, use it (but not for 500 errors)
    if (message && error.response.status !== 500) {
      return message;
    }
  }

  return fallback;
}

/**
 * Extract error message from axios errors or generic errors
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
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
