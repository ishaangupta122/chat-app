import { User, Chat, Message } from "@/types/client";

// Current logged-in user
export const currentUser: User = {
  id: "user-1",
  username: "johndoe",
  displayName: "John Doe",
  status: "online",
  avatar: undefined,
};

// Contacts list
export const contacts: User[] = [
  {
    id: "user-2",
    username: "alicesmith",
    displayName: "Alice Smith",
    status: "online",
  },
  {
    id: "user-3",
    username: "bobjohnson",
    displayName: "Bob Johnson",
    status: "offline",
  },
  {
    id: "user-4",
    username: "carolw",
    displayName: "Carol Williams",
    status: "away",
  },
  {
    id: "user-5",
    username: "davidb",
    displayName: "David Brown",
    status: "online",
  },
];

// Chat list
export const chats: Chat[] = [
  {
    id: "chat-1",
    type: "private",
    participants: [contacts[0]],
    lastMessage: {
      id: "msg-1",
      chatId: "chat-1",
      senderId: "user-2",
      content: "Hey! How are you doing?",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: "read",
    },
    unreadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "chat-2",
    type: "private",
    participants: [contacts[1]],
    lastMessage: {
      id: "msg-2",
      chatId: "chat-2",
      senderId: "user-3",
      content: "Check out this code snippet I wrote!",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: "delivered",
    },
    unreadCount: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "chat-3",
    type: "group",
    name: "Development Team",
    participants: [contacts[0], contacts[1], contacts[2]],
    lastMessage: {
      id: "msg-3",
      chatId: "chat-3",
      senderId: "user-4",
      content: "Meeting at 3 PM today",
      type: "text",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: "sent",
    },
    unreadCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Messages for chat-1
export const messagesForChat1: Message[] = [
  {
    id: "msg-1",
    chatId: "chat-1",
    senderId: "user-2",
    content: "Hey! How are you doing?",
    type: "text",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: "read",
  },
  {
    id: "msg-2",
    chatId: "chat-1",
    senderId: "user-1",
    content: `I'm doing great! Just working on this new chat app. Check out this code:

\`\`\`typescript
interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

function sendMessage(msg: Message) {
  console.log('Sending:', msg);
}
\`\`\`

Pretty cool, right?`,
    type: "text",
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    status: "read",
  },
  {
    id: "msg-3",
    chatId: "chat-1",
    senderId: "user-2",
    content: `That's awesome! Here's a Python version:

\`\`\`python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Message:
    id: str
    content: str
    timestamp: datetime

def send_message(msg: Message):
    print(f'Sending: {msg}')
\`\`\``,
    type: "text",
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
    status: "read",
  },
  {
    id: "msg-4",
    chatId: "chat-1",
    senderId: "user-1",
    content: "Nice! The dataclass decorator is so clean 🎉",
    type: "text",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: "read",
  },
  {
    id: "msg-5",
    chatId: "chat-1",
    senderId: "user-2",
    content: "Thanks! Let me know if you need any help with the project.",
    type: "text",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: "read",
  },
];

// Get messages by chat ID
export function getMessagesByChatId(chatId: string): Message[] {
  if (chatId === "chat-1") {
    return messagesForChat1;
  }
  return [];
}
