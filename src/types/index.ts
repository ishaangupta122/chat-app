// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: Date;
}

// Message Types
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "code" | "audio" | "video";
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  replyTo?: string;
  codeBlock?: CodeBlock;
  attachments?: Attachment[];
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

// Chat Types
export interface Chat {
  id: string;
  type: "private" | "group";
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Context Types
export interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string, type?: Message["type"]) => void;
  isLoading: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Socket Event Types
export interface SocketEvents {
  "message:new": (message: Message) => void;
  "message:update": (message: Message) => void;
  "message:delete": (messageId: string) => void;
  "user:typing": (data: { chatId: string; userId: string }) => void;
  "user:online": (userId: string) => void;
  "user:offline": (userId: string) => void;
}
