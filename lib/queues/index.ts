// lib/queues/index.ts
// BullMQ Queue definitions — Redis backed job queues
import { Queue } from "bullmq";
import { bullmqRedis } from "@/lib/redis";

// ─── Queue: Interview Evaluation ──────────────────────────────────────────────
export type InterviewEvalJobData = {
    sessionId: string;
    clerkUserId: string;
    jobTitle: string;
};

export const interviewEvalQueue = new Queue<InterviewEvalJobData>(
    "interview-evaluation",
    {
        connection: bullmqRedis,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 50 },
        },
    }
);

// ─── Queue: Resume AI Analysis ────────────────────────────────────────────────
export type ResumeAnalysisJobData = {
    resumeId: string;
    clerkUserId: string;
};

export const resumeAnalysisQueue = new Queue<ResumeAnalysisJobData>(
    "resume-analysis",
    {
        connection: bullmqRedis,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 50 },
        },
    }
);

// ─── Queue: Leaderboard Update ────────────────────────────────────────────────
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
        connection: bullmqRedis,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "fixed", delay: 1000 },
            removeOnComplete: { count: 200 },
            removeOnFail: { count: 50 },
        },
    }
);

console.log("[bullmq] Queues initialized: interview-evaluation, resume-analysis, leaderboard-update");