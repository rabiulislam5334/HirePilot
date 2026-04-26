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
    const message = err instanceof Error ? err.message : "Failed to start interview";
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
      sessionId: params.sessionId,
      clerkUserId: userId,
      lastAnswer: params.lastAnswer,
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

export async function finishInterview(sessionId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };
  return completeInterview(sessionId, userId);
}

export async function getInterviewResult(sessionId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });

  return session;
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
