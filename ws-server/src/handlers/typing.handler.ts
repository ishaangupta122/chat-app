import type { Server, Socket } from "socket.io";

interface TypingData {
  roomId: string;
  isTyping: boolean;
}

// Track active typing users per room
const typingUsers = new Map<string, Set<string>>();

/**
 * Handle typing indicator events
 */
export function handleTyping(
  io: Server,
  socket: Socket,
  data: TypingData
): void {
  const { userId } = socket.auth;
  const { roomId, isTyping } = data;

  if (!roomId) {
    return;
  }

  // Get or create typing set for room
  if (!typingUsers.has(roomId)) {
    typingUsers.set(roomId, new Set());
  }

  const roomTyping = typingUsers.get(roomId)!;

  if (isTyping) {
    roomTyping.add(userId);
  } else {
    roomTyping.delete(userId);
  }

  // Broadcast typing status to room (excluding sender)
  socket.to(roomId).emit("typing:update", {
    roomId,
    userId,
    isTyping,
    typingUsers: Array.from(roomTyping),
  });
}

/**
 * Get users currently typing in a room
 */
export function getTypingUsers(roomId: string): string[] {
  return Array.from(typingUsers.get(roomId) || []);
}

/**
 * Clear typing status for a user in all rooms (on disconnect)
 */
export function clearUserTyping(userId: string): void {
  for (const [roomId, users] of typingUsers.entries()) {
    if (users.has(userId)) {
      users.delete(userId);
    }
  }
}
