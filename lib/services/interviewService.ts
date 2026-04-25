import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
  generateInterviewQuestions,
  evaluateInterview,
  analyzeTranscriptLocally,
  type InterviewEval,
} from "./aiService";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InterviewCategory = "behavioral" | "technical" | "mixed";
export type InterviewDifficulty = "easy" | "medium" | "hard";

export interface TranscriptEntry {
  question: string;
  questionType: string;
  answer: string;
  answeredAt: string;
}

// ─── Session Management ───────────────────────────────────────────────────────

export async function createInterviewSession(params: {
  clerkUserId: string;
  jobTitle: string;
  company?: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
}) {
  return prisma.interviewSession.create({
    data: {
      userId: params.clerkUserId,
      jobTitle: params.jobTitle,
      company: params.company,
      category: params.category,
      difficulty: params.difficulty,
      questions: [],
      status: "ongoing",
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
    where: { userId: clerkUserId, status: "completed" },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      jobTitle: true,
      company: true,
      score: true,
      category: true,
      difficulty: true,
      completedAt: true,
      fillerWordCount: true,
      confidenceScore: true,
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
  const lastEntry = transcript[transcript.length - 1];

  const question = await generateInterviewQuestions({
    jobTitle: session.jobTitle ?? "Software Engineer",
    company: session.company ?? undefined,
    category: session.category as InterviewCategory,
    difficulty: session.difficulty as InterviewDifficulty,
    previousQuestion: lastEntry?.question,
    previousAnswer: params.lastAnswer,
  });

  return question;
}

// ─── Save Answer & Advance ────────────────────────────────────────────────────

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
      question: params.question,
      questionType: params.questionType,
      answer: params.answer,
      answeredAt: new Date().toISOString(),
    },
  ];

  await prisma.interviewSession.update({
    where: { id: params.sessionId },
    data: { transcript: updated as object[] },
  });

  return { questionNumber: updated.length };
}

// ─── Complete & Evaluate ──────────────────────────────────────────────────────

export async function completeInterview(
  sessionId: string,
  clerkUserId: string
): Promise<{ success: true; eval: InterviewEval } | { success: false; error: string }> {
  try {
    const session = await getInterviewSession(sessionId, clerkUserId);
    if (!session) return { success: false, error: "Session not found" };

    const transcript = (session.transcript as TranscriptEntry[] | null) ?? [];
    if (transcript.length === 0) {
      return { success: false, error: "No answers recorded" };
    }

    // Communication analysis (fast, local)
    const allAnswers = transcript.map((t) => t.answer).join(" ");
    const commAnalysis = analyzeTranscriptLocally(allAnswers);

    // AI evaluation (deeper)
    const evaluation = await evaluateInterview(
      transcript.map((t) => ({ question: t.question, answer: t.answer })),
      session.jobTitle ?? "the position"
    );

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        score: evaluation.overallScore,
        feedback: evaluation.detailedFeedback,
        fillerWordCount: commAnalysis.fillerWordCount,
        speakingPaceWpm: commAnalysis.speakingPaceWpm,
        confidenceScore: evaluation.confidenceScore,
        clarityScore: evaluation.communicationScore,
        status: "completed",
        completedAt: new Date(),
      },
    });

    // Update leaderboard
    await updateLeaderboard(clerkUserId, evaluation.overallScore, "interview");

    return { success: true, eval: evaluation };
  } catch (err: any) {
    console.error("[interviewService] complete error:", err);
    return { success: false, error: err.message ?? "Evaluation failed" };
  }
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

const LEADERBOARD_KEY = "hirepilot:leaderboard:global";
const WEEKLY_KEY = `hirepilot:leaderboard:weekly:${getWeekKey()}`;

function getWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const week = Math.ceil(
    ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
  );
  return `${year}:w${week}`;
}

export async function updateLeaderboard(
  clerkUserId: string,
  score: number,
  type: "interview" | "resume"
) {
  const points = type === "interview" ? score : Math.floor(score / 2);

  // Redis sorted set — higher = better
  await redis.zadd(LEADERBOARD_KEY, "XX", "GT", points, clerkUserId);
  await redis.zadd(LEADERBOARD_KEY, "NX", points, clerkUserId);
  await redis.zadd(WEEKLY_KEY, "XX", "GT", points, clerkUserId);
  await redis.zadd(WEEKLY_KEY, "NX", points, clerkUserId);
  await redis.expire(WEEKLY_KEY, 60 * 60 * 24 * 7); // 7 days

  // DB sync
  await prisma.leaderboard.upsert({
    where: { userId: clerkUserId },
    update: {
      totalScore: { increment: points },
      xp: { increment: points * 10 },
      weeklyScore: { increment: points },
    },
    create: {
      userId: clerkUserId,
      totalScore: points,
      xp: points * 10,
      weeklyScore: points,
      level: 1,
    },
  });
}

export async function getGlobalLeaderboard(limit = 20) {
  // Get top users from Redis
  const entries = await redis.zrevrange(LEADERBOARD_KEY, 0, limit - 1, "WITHSCORES");

  const results: Array<{ userId: string; score: number; rank: number }> = [];
  for (let i = 0; i < entries.length; i += 2) {
    results.push({
      userId: entries[i],
      score: parseFloat(entries[i + 1]),
      rank: Math.floor(i / 2) + 1,
    });
  }

  // Enrich with user data from DB
  const userIds = results.map((r) => r.userId);
  const accounts = await prisma.account.findMany({
    where: { clerkId: { in: userIds } },
    select: { clerkId: true, name: true, image: true, leaderboard: true },
  });

  return results.map((r) => {
    const account = accounts.find((a) => a.clerkId === r.userId);
    return {
      ...r,
      name: account?.name ?? "Anonymous",
      image: account?.image,
      xp: account?.leaderboard?.xp ?? 0,
      level: account?.leaderboard?.level ?? 1,
      badges: account?.leaderboard?.badges ?? [],
    };
  });
}

export async function getUserRank(clerkUserId: string) {
  const rank = await redis.zrevrank(LEADERBOARD_KEY, clerkUserId);
  return rank !== null ? rank + 1 : null;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getInterviewAnalytics(clerkUserId: string) {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId: clerkUserId, status: "completed" },
    orderBy: { completedAt: "asc" },
    select: {
      score: true,
      confidenceScore: true,
      clarityScore: true,
      fillerWordCount: true,
      completedAt: true,
      jobTitle: true,
    },
  });

  if (sessions.length === 0) {
    return { sessions: [], avgScore: 0, trend: "no data", totalSessions: 0 };
  }

  const avgScore = Math.round(
    sessions.reduce((s, r) => s + (r.score ?? 0), 0) / sessions.length
  );

  // Simple trend: last 3 vs previous 3
  const recent = sessions.slice(-3).map((s) => s.score ?? 0);
  const older = sessions.slice(-6, -3).map((s) => s.score ?? 0);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
  const olderAvg = older.reduce((a, b) => a + b, 0) / (older.length || 1);
  const trend =
    older.length === 0
      ? "not enough data"
      : recentAvg > olderAvg + 5
      ? "improving"
      : recentAvg < olderAvg - 5
      ? "declining"
      : "stable";

  return { sessions, avgScore, trend, totalSessions: sessions.length };
}
