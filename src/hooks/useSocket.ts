"use client";

import { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";

export function useSocket(userId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socketInstance = connectSocket(userId);
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      disconnectSocket();
    };
  }, [userId]);

  const emit = useCallback(
    (event: string, data?: unknown) => {
      socket?.emit(event, data);
    },
    [socket]
  );

  const on = useCallback(
    (event: string, callback: (...args: unknown[]) => void) => {
      socket?.on(event, callback);
      return () => {
        socket?.off(event, callback);
      };
    },
    [socket]
  );

  return { socket, isConnected, emit, on };
}
