// hooks/useSocket.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

// Singleton socket — page reload ছাড়া একটাই connection
let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket) {
    _socket = io({
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });
  }
  return _socket;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
  }, []);

  const emit = useCallback(<T>(event: string, data?: T) => {
    getSocket().emit(event, data);
  }, []);

  const on = useCallback(<T>(event: string, handler: (data: T) => void) => {
    const s = getSocket();
    s.on(event, handler);
    return () => { s.off(event, handler); };
  }, []);

  return { emit, on, socket: socketRef };
}

// ─── Leaderboard hook ──────────────────────────────────────────────────────────

export type LeaderboardUpdate = {
  userId: string;
  name: string;
  score: number;
  jobTitle: string;
  rank?: number;
};

export function useLeaderboardSocket(
  onUpdate: (data: LeaderboardUpdate) => void,
  onOnlineCount?: (count: number) => void
) {
  const { emit, on } = useSocket();

  useEffect(() => {
    emit("join_leaderboard");

    const offUpdate = on<LeaderboardUpdate>("leaderboard_updated", onUpdate);
    const offCount  = onOnlineCount
      ? on<number>("online_count", onOnlineCount)
      : () => {};

    return () => {
      emit("leave_leaderboard");
      offUpdate();
      offCount();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { emit };
}

// ─── Interview Session hook ────────────────────────────────────────────────────

export type SessionEvaluated = {
  sessionId: string;
  score: number;
  feedback: string;
};

export function useInterviewSessionSocket(
  sessionId: string | null,
  onEvaluated: (data: SessionEvaluated) => void
) {
  const { emit, on } = useSocket();

  useEffect(() => {
    if (!sessionId) return;
    emit("join_session", sessionId);

    const offEval = on<SessionEvaluated>("session_evaluated", onEvaluated);

    return () => {
      emit("leave_session", sessionId);
      offEval();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);
}