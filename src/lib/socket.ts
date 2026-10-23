import { io, Socket } from "socket.io-client";
import { getWsToken } from "./auth";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket"],
      // Auth is handled via query param during handshake
    });
  }
  return socket;
};

/**
 * Connect to WebSocket server with JWT authentication
 * Token is sent as query param during handshake
 */
export const connectSocket = (): Socket | null => {
  const token = getWsToken();

  if (!token) {
    console.warn("[Socket] No auth token available, cannot connect");
    return null;
  }

  const socket = getSocket();

  if (!socket.connected) {
    // Set auth token in query params for handshake
    socket.io.opts.query = { token };
    socket.connect();
  }

  return socket;
};

/**
 * Reconnect with a fresh token (after refresh)
 */
export const reconnectSocket = (): Socket | null => {
  if (socket?.connected) {
    socket.disconnect();
  }
  return connectSocket();
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const emitTyping = (roomId: string, isTyping: boolean) => {
  const event = isTyping ? "typing:start" : "typing:stop";
  socket?.emit(event, { roomId });
};

export const joinRoom = (roomId: string) => {
  socket?.emit("room:join", { roomId });
};

export const leaveRoom = (roomId: string) => {
  socket?.emit("room:leave", { roomId });
};

export const sendMessage = (
  roomId: string,
  content: string,
  type: string = "text"
) => {
  socket?.emit("message:send", { roomId, content, type });
};

export const markAsRead = (roomId: string, messageId: string) => {
  socket?.emit("message:read", { roomId, messageId });
};
