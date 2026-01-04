import { Server as HttpServer, createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { authenticateConnection, type JWTPayload } from "./utils/auth.js";
import { setupSocketHandlers } from "./socket.js";

// Extend Socket type to include auth data
declare module "socket.io" {
  interface Socket {
    auth: JWTPayload;
  }
}

// Environment config
const PORT = parseInt(process.env.WS_PORT || "3001", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Create HTTP server
const httpServer: HttpServer = createServer();

// Create Socket.IO server with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Connection timeout
  connectTimeout: 10000,
});

/**
 * Authentication middleware - runs during handshake
 * Rejects connections with invalid/missing JWT
 */
io.use(async (socket, next) => {
  try {
    const authPayload = await authenticateConnection(socket.handshake);

    if (!authPayload) {
      return next(new Error("Authentication failed: Invalid or missing token"));
    }

    // Attach auth data to socket for later use
    socket.auth = authPayload;

    console.log(`[Auth] User ${authPayload.userId} authenticated`);
    next();
  } catch (error) {
    console.error("[Auth] Authentication error:", error);
    next(new Error("Authentication failed"));
  }
});

/**
 * Handle new connections
 */
io.on("connection", (socket) => {
  const { userId, email } = socket.auth;
  console.log(
    `[Connect] User ${userId} (${email}) connected - Socket ID: ${socket.id}`
  );

  // Set up event handlers for this socket
  setupSocketHandlers(io, socket);

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`[Disconnect] User ${userId} disconnected - Reason: ${reason}`);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 CORS origin: ${CORS_ORIGIN}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  io.close(() => {
    httpServer.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
});

export { io };
