// lib/services/interviewService.ts
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
  generateInterviewQuestions,
  analyzeTranscriptLocally,
  type InterviewEval,
} from "./aiService";
import { interviewEvalQueue, leaderboardQueue } from "@/lib/queues";

export type InterviewCategory = "behavioral" | "technical" | "mixed";
export type InterviewDifficulty = "easy" | "medium" | "hard";

export interface TranscriptEntry {
  question: string;
  questionType: string;
  answer: string;
  answeredAt: string;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function createInterviewSession(params: {
  clerkUserId: string;
  jobTitle: string;
  company?: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
}) {
  return prisma.interviewSession.create({
    data: {
      userId:     params.clerkUserId,
      jobTitle:   params.jobTitle,
      company:    params.company,
      category:   params.category,
      difficulty: params.difficulty,
      questions:  [],
      status:     "ongoing",
    },
  });
}

export async function getInterviewSession(id: string, clerkUserId: string) {
  return prisma.interviewSession.findFirst({
    where: { id, userId: clerkUserId },
  });
}

export async function getInterviewHistory(clerkUserId: string) {
  return prisma.interviewSession.findMany({
    where:   { userId: clerkUserId, status: "completed" },
    orderBy: { completedAt: "desc" },
    select: {
      id: true, jobTitle: true, company: true, score: true,
      category: true, difficulty: true, completedAt: true,
      fillerWordCount: true, confidenceScore: true,
    },
  });
}

// ─── Question Flow ────────────────────────────────────────────────────────────

export async function getNextQuestion(params: {
  sessionId: string;
  clerkUserId: string;
  lastAnswer?: string;
}) {
  const session = await getInterviewSession(params.sessionId, params.clerkUserId);
  if (!session) throw new Error("Session not found");

  const transcript = (session.transcript as TranscriptEntry[] | null) ?? [];
  const lastEntry  = transcript[transcript.length - 1];

  return generateInterviewQuestions({
    jobTitle:         session.jobTitle ?? "Software Engineer",
    company:          session.company  ?? undefined,
    category:         session.category as InterviewCategory,
    difficulty:       session.difficulty as InterviewDifficulty,
    previousQuestion: lastEntry?.question,
    previousAnswer:   params.lastAnswer,
  });
}

export async function saveAnswer(params: {
  sessionId: string;
  clerkUserId: string;
  question: string;
  questionType: string;
  answer: string;
}) {
  const session = await getInterviewSession(params.sessionId, params.clerkUserId);
  if (!session) throw new Error("Session not found");

  const existing = (session.transcript as TranscriptEntry[] | null) ?? [];
  const updated: TranscriptEntry[] = [
    ...existing,
    {
      question:     params.question,
      questionType: params.questionType,
      answer:       params.answer,
      answeredAt:   new Date().toISOString(),
    },
  ];

  await prisma.interviewSession.update({
    where: { id: params.sessionId },
    data:  { transcript: updated as object[] },
  });

  return { questionNumber: updated.length };
}

// ─── Complete Interview — BullMQ queue এ job দাও ─────────────────────────────

export async function completeInterview(
  sessionId: string,
  clerkUserId: string
): Promise<{ success: true; jobId: string } | { success: false; error: string }> {
  try {
    const session = await getInterviewSession(sessionId, clerkUserId);
    if (!session) return { success: false, error: "Session not found" };

    const transcript = (session.transcript as TranscriptEntry[] | null) ?? [];
    if (transcript.length === 0) return { success: false, error: "No answers recorded" };

    // Mark as processing
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data:  { status: "processing" },
    });

    // Add to BullMQ queue — AI evaluation runs in background
    const job = await interviewEvalQueue.add(
      "evaluate",
      {
        sessionId,
        clerkUserId,
        jobTitle: session.jobTitle ?? "Interview",
      },
      { priority: 1 }
    );

    console.log(`[interviewService] queued evaluation job: ${job.id}`);
    return { success: true, jobId: job.id! };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to queue evaluation";
    console.error("[interviewService] completeInterview error:", err);
    return { success: false, error: message };
  }
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

const GLOBAL_KEY = "hirepilot:leaderboard:global";

function getWeekKey(): string {
  const now  = new Date();
  const year = now.getFullYear();
  const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
  return `hirepilot:leaderboard:weekly:${year}:w${week}`;
}

export async function updateLeaderboard(
  clerkUserId: string,
  score: number,
  type: "interview" | "resume",
  jobTitle?: string
): Promise<number | null> {
  // Queue the leaderboard update
  const account = await prisma.account.findFirst({
    where:  { clerkId: clerkUserId },
    select: { name: true },
  });

  await leaderboardQueue.add("update", {
    clerkUserId,
    score,
    type,
    jobTitle,
    name: account?.name ?? undefined,
  });

  // Return current rank immediately (before queue processes)
  const rank = await redis.zrevrank(GLOBAL_KEY, clerkUserId);
  return rank !== null ? rank + 1 : null;
}

export async function getGlobalLeaderboard(limit = 20) {
  const entries = await redis.zrevrange(GLOBAL_KEY, 0, limit - 1, "WITHSCORES");

  const results: Array<{ userId: string; score: number; rank: number }> = [];
  for (let i = 0; i < entries.length; i += 2) {
    results.push({
      userId: entries[i],
      score:  parseFloat(entries[i + 1]),
      rank:   Math.floor(i / 2) + 1,
    });
  }

  const userIds  = results.map(r => r.userId);
  const accounts = await prisma.account.findMany({
    where:  { clerkId: { in: userIds } },
    select: { clerkId: true, name: true, image: true, leaderboard: true },
  });

  return results.map(r => {
    const account = accounts.find(a => a.clerkId === r.userId);
    return {
      ...r,
      name:   account?.name  ?? "Anonymous",
      image:  account?.image ?? null,
      xp:     account?.leaderboard?.xp     ?? 0,
      level:  account?.leaderboard?.level  ?? 1,
      badges: account?.leaderboard?.badges ?? [],
    };
  });
}

export async function getUserRank(clerkUserId: string): Promise<number | null> {
  const rank = await redis.zrevrank(GLOBAL_KEY, clerkUserId);
  return rank !== null ? rank + 1 : null;
}

export async function getInterviewAnalytics(clerkUserId: string) {
  const sessions = await prisma.interviewSession.findMany({
    where:   { userId: clerkUserId, status: "completed" },
    orderBy: { completedAt: "asc" },
    select:  {
      score: true, confidenceScore: true, clarityScore: true,
      fillerWordCount: true, completedAt: true, jobTitle: true,
    },
  });

  if (sessions.length === 0) {
    return { sessions: [], avgScore: 0, trend: "no data", totalSessions: 0 };
  }

  const avgScore  = Math.round(sessions.reduce((s, r) => s + (r.score ?? 0), 0) / sessions.length);
  const recent    = sessions.slice(-3).map(s => s.score ?? 0);
  const older     = sessions.slice(-6, -3).map(s => s.score ?? 0);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
  const olderAvg  = older.reduce((a, b)  => a + b, 0) / (older.length  || 1);

  const trend =
    older.length === 0          ? "not enough data"
    : recentAvg > olderAvg + 5 ? "improving"
    : recentAvg < olderAvg - 5 ? "declining"
    : "stable";

  return { sessions, avgScore, trend, totalSessions: sessions.length };
}