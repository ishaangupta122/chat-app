import type { Server, Socket } from "socket.io";
import { updatePresence, getPresence } from "../store/presence.js";

interface PresenceData {
  status?: "online" | "away" | "busy";
}

/**
 * Handle presence update events
 */
export function handlePresence(
  io: Server,
  socket: Socket,
  data: PresenceData
): void {
  const { userId } = socket.auth;
  const { status = "online" } = data;

  // Update presence in store
  updatePresence(userId, status);

  // Broadcast presence change to all connected users
  socket.broadcast.emit("presence:update", {
    userId,
    status,
    updatedAt: new Date().toISOString(),
  });

  console.log(`[Presence] User ${userId} status changed to ${status}`);
}

/**
 * Get current presence for a list of users
 */
export function getMultiplePresence(userIds: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const userId of userIds) {
    result[userId] = getPresence(userId);
  }

  return result;
}
