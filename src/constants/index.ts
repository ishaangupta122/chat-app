// App Constants
export const APP_NAME = "ChatApp";
export const APP_DESCRIPTION =
  "A WhatsApp-like chat application with code rendering";

// Message Constants
export const MAX_MESSAGE_LENGTH = 10000;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/zip",
];

// Code Languages for Syntax Highlighting
export const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
  "json",
  "yaml",
  "markdown",
  "bash",
  "shell",
  "plaintext",
] as const;

// UI Constants
export const SIDEBAR_WIDTH = 380;
export const CHAT_INPUT_MAX_HEIGHT = 200;

// Status Colors
export const STATUS_COLORS = {
  online: "#14b8a6",
  offline: "#6b7280",
  away: "#f59e0b",
} as const;

// Emoji Categories
export const EMOJI_CATEGORIES = [
  "smileys",
  "people",
  "animals",
  "food",
  "travel",
  "activities",
  "objects",
  "symbols",
  "flags",
] as const;

// Keyboard Shortcuts
export const SHORTCUTS = {
  newMessage: "ctrl+n",
  search: "ctrl+k",
  settings: "ctrl+,",
  sendMessage: "Enter",
  newLine: "Shift+Enter",
} as const;

// Auth Constants
export const AUTH = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
  ACCESS_TOKEN_EXPIRY_MS: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  PASSWORD_MIN_LENGTH: 8,
} as const;

// WebSocket Constants
export const WS = {
  PING_INTERVAL: 30000, // 30 seconds
  PONG_TIMEOUT: 10000, // 10 seconds
  RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
} as const;
