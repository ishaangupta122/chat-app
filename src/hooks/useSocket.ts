"use client";

import { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { isAuthenticated } from "@/lib/auth";

/**
 * Hook to manage WebSocket connection with JWT authentication
 * Automatically connects when user is authenticated
 */
export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated()) {
      return;
    }

    const socketInstance = connectSocket();

    if (!socketInstance) {
      setConnectionError("Failed to connect: No authentication token");
      return;
    }

    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log("[Socket] Connected");
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log("[Socket] Disconnected:", reason);
    };

    const onConnectError = (error: Error) => {
      setConnectionError(error.message);
      console.error("[Socket] Connection error:", error.message);
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("connect_error", onConnectError);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.off("connect_error", onConnectError);
      disconnectSocket();
    };
  }, []);

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

  return { socket, isConnected, connectionError, emit, on };
}
