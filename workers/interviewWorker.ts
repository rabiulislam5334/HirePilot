// workers/interviewWorker.ts
// BullMQ Workers — background job processing
import { Worker } from "bullmq";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { evaluateInterview, analyzeResume, analyzeTranscriptLocally } from "@/lib/services/aiService";
import type {
  InterviewEvalJobData,
  ResumeAnalysisJobData,
  LeaderboardUpdateJobData,
} from "@/lib/queues";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  password: process.env.REDIS_PASSWORD ?? undefined,
};

const GLOBAL_KEY = "hirepilot:leaderboard:global";

// ─── Helper: emit socket event ────────────────────────────────────────────────

function emitSocket(event: string, room: string, data: object) {
  if (global._io) {
    global._io.to(room).emit(event, data);
  }
}

// ─── Worker 1: Interview Evaluation ──────────────────────────────────────────

const interviewWorker = new Worker<InterviewEvalJobData>(
  "interview-evaluation",
  async (job) => {
    const { sessionId, clerkUserId, jobTitle } = job.data;
    console.log(`[worker] interview-evaluation: session=${sessionId}`);

    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId: clerkUserId },
    });

    if (!session?.transcript) {
      throw new Error("Session or transcript not found");
    }

    type TranscriptEntry = { question: string; answer: string };
    const transcript = session.transcript as TranscriptEntry[];

    // Communication analysis (fast, local)
    const allAnswers   = transcript.map((t) => t.answer).join(" ");
    const commAnalysis = analyzeTranscriptLocally(allAnswers);

    // AI evaluation (slow — runs in background via BullMQ)
    const evaluation = await evaluateInterview(
      transcript.map((t) => ({ question: t.question, answer: t.answer })),
      jobTitle
    );

    // Save to DB
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        score:           evaluation.overallScore,
        feedback:        evaluation.detailedFeedback,
        fillerWordCount: commAnalysis.fillerWordCount,
        speakingPaceWpm: commAnalysis.speakingPaceWpm,
        confidenceScore: evaluation.confidenceScore,
        clarityScore:    evaluation.communicationScore,
        status:          "completed",
        completedAt:     new Date(),
      },
    });

    // Add to leaderboard queue
    const account = await prisma.account.findFirst({
      where: { clerkId: clerkUserId },
      select: { name: true },
    });

    // Notify client via Socket.io — session result ready
    emitSocket("session_evaluated", `session:${sessionId}`, {
      sessionId,
      score:    evaluation.overallScore,
      feedback: evaluation.detailedFeedback,
    });

    console.log(`[worker] interview evaluated: score=${evaluation.overallScore}`);

    return {
      score:    evaluation.overallScore,
      name:     account?.name ?? "Anonymous",
      jobTitle,
    };
  },
  { connection, concurrency: 3 }
);

// ─── Worker 2: Resume Analysis ────────────────────────────────────────────────

const resumeWorker = new Worker<ResumeAnalysisJobData>(
  "resume-analysis",
  async (job) => {
    const { resumeId, clerkUserId } = job.data;
    console.log(`[worker] resume-analysis: resume=${resumeId}`);

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: clerkUserId },
    });

    if (!resume?.parsedText) throw new Error("Resume not found");

    const analysis = await analyzeResume(resume.parsedText);

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        atsScore: analysis.atsScore,
        skills:   analysis.extractedSkills,
        feedback: analysis.overallFeedback,
        jsonData: analysis as object,
      },
    });

    // Notify client — resume analysis done
    emitSocket("resume_analyzed", `user:${clerkUserId}`, {
      resumeId,
      atsScore: analysis.atsScore,
      feedback: analysis.overallFeedback,
    });

    console.log(`[worker] resume analyzed: atsScore=${analysis.atsScore}`);
    return { atsScore: analysis.atsScore };
  },
  { connection, concurrency: 2 }
);

// ─── Worker 3: Leaderboard Update ─────────────────────────────────────────────

const leaderboardWorker = new Worker<LeaderboardUpdateJobData>(
  "leaderboard-update",
  async (job) => {
    const { clerkUserId, score, type, jobTitle, name } = job.data;
    console.log(`[worker] leaderboard-update: user=${clerkUserId} score=${score}`);

    const points    = type === "interview" ? score : Math.floor(score / 2);
    const weeklyKey = getWeekKey();

    // Redis update — keep highest score
    const currentGlobal = await redis.zscore(GLOBAL_KEY, clerkUserId);
    if (currentGlobal === null || points > parseFloat(currentGlobal)) {
      await redis.zadd(GLOBAL_KEY, points, clerkUserId);
    }
    const currentWeekly = await redis.zscore(weeklyKey, clerkUserId);
    if (currentWeekly === null || points > parseFloat(currentWeekly)) {
      await redis.zadd(weeklyKey, points, clerkUserId);
    }
    await redis.expire(weeklyKey, 60 * 60 * 24 * 7);

    // DB update
    await prisma.leaderboard.upsert({
      where:  { userId: clerkUserId },
      update: {
        totalScore:  { increment: points },
        xp:          { increment: points * 10 },
        weeklyScore: { increment: points },
      },
      create: {
        userId: clerkUserId, totalScore: points,
        xp: points * 10, weeklyScore: points, level: 1,
      },
    });

    // Get rank
    const rankRaw = await redis.zrevrank(GLOBAL_KEY, clerkUserId);
    const rank    = rankRaw !== null ? rankRaw + 1 : null;

    // Broadcast to all leaderboard viewers via Socket.io
    emitSocket("leaderboard_updated", "leaderboard", {
      userId: clerkUserId,
      name:   name ?? "Anonymous",
      score:  points,
      jobTitle: jobTitle ?? "Interview",
      rank,
    });

    console.log(`[worker] leaderboard updated: rank=${rank}`);
    return { rank };
  },
  { connection, concurrency: 5 }
);

// ─── Worker event handlers ────────────────────────────────────────────────────

for (const worker of [interviewWorker, resumeWorker, leaderboardWorker]) {
  worker.on("completed", (job) => {
    console.log(`[worker] ✓ ${job.queueName} job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] ✗ ${job?.queueName} job ${job?.id} failed:`, err.message);
  });
}

function getWeekKey(): string {
  const now  = new Date();
  const year = now.getFullYear();
  const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
  return `hirepilot:leaderboard:weekly:${year}:w${week}`;
}

console.log("[bullmq] Workers started: interview-evaluation, resume-analysis, leaderboard-update");

export { interviewWorker, resumeWorker, leaderboardWorker };