"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  createInterviewSession,
  getNextQuestion,
  saveAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewAnalytics,
  getGlobalLeaderboard,
  getUserRank,
  type InterviewCategory,
  type InterviewDifficulty,
} from "@/lib/services/interviewService";

export async function startInterview(params: {
  jobTitle: string;
  company?: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  try {
    const session = await createInterviewSession({ clerkUserId: userId, ...params });
    return { success: true as const, sessionId: session.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start";
    return { success: false as const, error: message };
  }
}

export async function fetchNextQuestion(params: {
  sessionId: string;
  lastAnswer?: string;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  try {
    const question = await getNextQuestion({
      sessionId:  params.sessionId,
      clerkUserId: userId,
      lastAnswer:  params.lastAnswer,
    });
    return { success: true as const, question };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get question";
    return { success: false as const, error: message };
  }
}

export async function submitAnswer(params: {
  sessionId: string;
  question: string;
  questionType: string;
  answer: string;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  try {
    const result = await saveAnswer({ clerkUserId: userId, ...params });
    return { success: true as const, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save answer";
    return { success: false as const, error: message };
  }
}

// ─── finishInterview — BullMQ queue এ দেয়, socket দিয়ে result পাবে ──────────

export async function finishInterview(sessionId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  // Queue the evaluation — background এ চলবে
  const result = await completeInterview(sessionId, userId);

  if (result.success) {
    // Client socket দিয়ে "session_evaluated" event এর জন্য wait করবে
    return { success: true as const, queued: true, jobId: result.jobId };
  }

  return { success: false as const, error: result.error };
}

export async function getInterviewResult(sessionId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });
}

export async function fetchInterviewHistory() {
  const { userId } = await auth();
  if (!userId) return [];
  return getInterviewHistory(userId);
}

export async function fetchInterviewAnalytics() {
  const { userId } = await auth();
  if (!userId) return null;
  return getInterviewAnalytics(userId);
}

export async function fetchLeaderboard() {
  return getGlobalLeaderboard(20);
}

export async function fetchMyRank() {
  const { userId } = await auth();
  if (!userId) return null;
  return getUserRank(userId);
}