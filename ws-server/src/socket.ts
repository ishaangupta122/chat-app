import type { Server, Socket } from "socket.io";
import { handleMessage } from "./handlers/message.handler.js";
import { handlePresence } from "./handlers/presence.handler.js";
import { handleTyping } from "./handlers/typing.handler.js";
import { addConnection, removeConnection } from "./store/connections.js";
import { setUserOnline, setUserOffline } from "./store/presence.js";

/**
 * Set up all event handlers for a connected socket
 * Auth is already verified at this point - socket.auth contains user data
 */
export function setupSocketHandlers(io: Server, socket: Socket): void {
  const { userId } = socket.auth;

  // Register this connection
  addConnection(userId, socket.id);

  // Mark user as online and broadcast presence
  setUserOnline(userId);
  socket.broadcast.emit("user:online", { userId });

  // Join user's personal room for direct messages
  socket.join(`user:${userId}`);

  // --- Message Events ---
  socket.on("message:send", (data) => handleMessage(io, socket, data));
  socket.on("message:read", (data) =>
    handleMessage(io, socket, { ...data, type: "read" })
  );

  // --- Typing Events ---
  socket.on("typing:start", (data) =>
    handleTyping(io, socket, { ...data, isTyping: true })
  );
  socket.on("typing:stop", (data) =>
    handleTyping(io, socket, { ...data, isTyping: false })
  );

  // --- Presence Events ---
  socket.on("presence:update", (data) => handlePresence(io, socket, data));

  // --- Room Management ---
  socket.on("room:join", ({ roomId }: { roomId: string }) => {
    socket.join(roomId);
    console.log(`[Room] User ${userId} joined room ${roomId}`);
  });

  socket.on("room:leave", ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
    console.log(`[Room] User ${userId} left room ${roomId}`);
  });

  // --- Disconnection Cleanup ---
  socket.on("disconnect", () => {
    removeConnection(userId, socket.id);

    // Only mark offline if no other connections exist for this user
    const remainingConnections = getConnectionCount(userId);
    if (remainingConnections === 0) {
      setUserOffline(userId);
      socket.broadcast.emit("user:offline", { userId, lastSeen: new Date() });
    }
  });
}

// Import helper from connections store
function getConnectionCount(userId: string): number {
  const { getConnections } = require("./store/connections.js");
  return getConnections(userId).length;
}
