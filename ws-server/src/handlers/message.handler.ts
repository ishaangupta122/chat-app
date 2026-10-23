import type { Server, Socket } from "socket.io";

interface SendMessageData {
  roomId: string;
  content: string;
  type?: "text" | "image" | "file" | "code";
  replyTo?: string;
}

interface ReadMessageData {
  type: "read";
  roomId: string;
  messageId: string;
}

type MessageData = SendMessageData | ReadMessageData;

/**
 * Handle message-related events
 * Note: Business logic (validation, storage) should be done via REST API
 * WebSocket only handles real-time delivery
 */
export function handleMessage(
  io: Server,
  socket: Socket,
  data: MessageData
): void {
  const { userId } = socket.auth;

  if ("type" in data && data.type === "read") {
    // Handle message read receipt
    handleReadReceipt(io, socket, data);
    return;
  }

  // Handle new message
  const messageData = data as SendMessageData;
  const { roomId, content, type = "text", replyTo } = messageData;

  if (!roomId || !content) {
    socket.emit("error", { message: "roomId and content are required" });
    return;
  }

  // Create message object (ID would come from REST API in production)
  const message = {
    id: generateTempId(),
    roomId,
    senderId: userId,
    content,
    type,
    replyTo,
    timestamp: new Date().toISOString(),
    status: "sent",
  };

  // Broadcast to room (including sender for confirmation)
  io.to(roomId).emit("message:new", message);

  console.log(`[Message] User ${userId} sent message to room ${roomId}`);
}

/**
 * Handle read receipt
 */
function handleReadReceipt(
  io: Server,
  socket: Socket,
  data: ReadMessageData
): void {
  const { userId } = socket.auth;
  const { roomId, messageId } = data;

  if (!roomId || !messageId) {
    return;
  }

  // Broadcast read receipt to room
  io.to(roomId).emit("message:read", {
    messageId,
    readBy: userId,
    readAt: new Date().toISOString(),
  });

  console.log(
    `[Message] User ${userId} read message ${messageId} in room ${roomId}`
  );
}

/**
 * Generate temporary ID (for real-time, actual ID comes from API)
 */
function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
