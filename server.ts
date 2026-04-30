// server.ts
// Next.js custom server — Socket.io + BullMQ worker একসাথে চালায়
import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import "./workers/interviewWorker"; // BullMQ worker start

const dev  = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);
const app  = next({ dev });
const handle = app.getRequestHandler();

// ─── Socket Events ────────────────────────────────────────────────────────────
//
// Client → Server:
//   join_leaderboard      — leaderboard room join
//   leave_leaderboard     — leaderboard room leave
//
// Server → Client:
//   leaderboard_updated   — নতুন score এলে সবাইকে notify
//     { userId, name, score, jobTitle, rank }
//   online_count          — কতজন leaderboard দেখছে
//   interview_progress    — interview session live status
//     { sessionId, questionNumber, totalQuestions }
//
// ─────────────────────────────────────────────────────────────────────────────

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "/", true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socketio",
    transports: ["websocket", "polling"],
  });

  // Store globally so server actions can emit events
  global._io = io;

  io.on("connection", (socket) => {
    console.log(`[socket] +connected: ${socket.id}`);

    // ─── Leaderboard Room ─────────────────────────────────────────────────

    socket.on("join_leaderboard", () => {
      socket.join("leaderboard");
      const count = io.sockets.adapter.rooms.get("leaderboard")?.size ?? 0;
      io.to("leaderboard").emit("online_count", count);
      console.log(`[socket] ${socket.id} joined leaderboard (${count} watching)`);
    });

    socket.on("leave_leaderboard", () => {
      socket.leave("leaderboard");
      const count = io.sockets.adapter.rooms.get("leaderboard")?.size ?? 0;
      io.to("leaderboard").emit("online_count", count);
    });

    // ─── Interview Session Room ────────────────────────────────────────────

    socket.on("join_session", (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      console.log(`[socket] ${socket.id} joined session:${sessionId}`);
    });

    socket.on("leave_session", (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
    });

    // ─── Disconnect ────────────────────────────────────────────────────────

    socket.on("disconnect", () => {
      const count = io.sockets.adapter.rooms.get("leaderboard")?.size ?? 0;
      io.to("leaderboard").emit("online_count", count);
      console.log(`[socket] -disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`\n🚀 HirePilot ready on http://localhost:${port}`);
    console.log(`   Socket.io: enabled (path: /api/socketio)`);
    console.log(`   BullMQ:    workers started\n`);
  });
});