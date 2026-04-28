// lib/queues/index.ts
// BullMQ Queue definitions — Redis backed job queues
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

// BullMQ needs a separate Redis connection config
const connection = {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
    password: process.env.REDIS_PASSWORD ?? undefined,
};

// ─── Queue: Interview Evaluation ──────────────────────────────────────────────
// Interview complete হলে AI evaluation এই queue তে যাবে
// Worker async এ process করবে — user কে wait করতে হবে না

export type InterviewEvalJobData = {
    sessionId: string;
    clerkUserId: string;
    jobTitle: string;
};

export const interviewEvalQueue = new Queue<InterviewEvalJobData>(
    "interview-evaluation",
    {
        connection,
        defaultJobOptions: {
            attempts: 3,                          // ৩ বার retry
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: { count: 100 },     // শেষ ১০০টা রাখো
            removeOnFail: { count: 50 },
        },
    }
);

// ─── Queue: Resume AI Analysis ────────────────────────────────────────────────
// Resume upload হলে background এ AI analysis চলবে

export type ResumeAnalysisJobData = {
    resumeId: string;
    clerkUserId: string;
};

export const resumeAnalysisQueue = new Queue<ResumeAnalysisJobData>(
    "resume-analysis",
    {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 50 },
        },
    }
);

// ─── Queue: Leaderboard Update ────────────────────────────────────────────────
// Score update হলে leaderboard recalculate করে socket emit করবে

export type LeaderboardUpdateJobData = {
    clerkUserId: string;
    score: number;
    type: "interview" | "resume";
    jobTitle?: string;
    name?: string;
};

export const leaderboardQueue = new Queue<LeaderboardUpdateJobData>(
    "leaderboard-update",
    {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "fixed", delay: 1000 },
            removeOnComplete: { count: 200 },
            removeOnFail: { count: 50 },
        },
    }
);

console.log("[bullmq] Queues initialized: interview-evaluation, resume-analysis, leaderboard-update");