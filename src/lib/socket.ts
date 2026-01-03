import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const socket = getSocket();

  if (!socket.connected) {
    socket.auth = { userId };
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const emitTyping = (chatId: string) => {
  socket?.emit("user:typing", { chatId });
};

export const joinChat = (chatId: string) => {
  socket?.emit("chat:join", { chatId });
};

export const leaveChat = (chatId: string) => {
  socket?.emit("chat:leave", { chatId });
};
