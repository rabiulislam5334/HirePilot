import { prisma } from "@/lib/prisma";
import { analyzeJobMatch, type JobMatch } from "./aiService";

// ─── AI-based Match (no embedding needed — works immediately) ─────────────────

export async function matchResumeToJob(params: {
  resumeId: string;
  clerkUserId: string;
  jobDescription: string;
  jobTitle: string;
  company?: string;
}): Promise<{ success: true; data: JobMatch } | { success: false; error: string }> {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: params.resumeId, userId: params.clerkUserId },
      select: { parsedText: true },
    });

    if (!resume?.parsedText) {
      return { success: false, error: "Resume not found" };
    }

    const result = await analyzeJobMatch(
      resume.parsedText,
      params.jobDescription,
      params.jobTitle
    );

    return { success: true, data: result };
  } catch (err: any) {
    console.error("[jobMatchService] match error:", err);
    return { success: false, error: err.message ?? "Match analysis failed" };
  }
}

// ─── Save Application with Match Score ────────────────────────────────────────

export async function applyToJob(params: {
  clerkUserId: string;
  jobId: string;
  resumeId: string;
  matchScore?: number;
  notes?: string;
}) {
  // Upsert — don't allow duplicate applications
  const existing = await prisma.application.findFirst({
    where: {
      userId: params.clerkUserId,
      jobId: params.jobId,
      resumeId: params.resumeId,
    },
  });

  if (existing) return existing;

  return prisma.application.create({
    data: {
      userId: params.clerkUserId,
      jobId: params.jobId,
      resumeId: params.resumeId,
      matchScore: params.matchScore,
      notes: params.notes,
      status: "applied",
    },
    include: { job: true },
  });
}

// ─── Job Tracker (Kanban) ─────────────────────────────────────────────────────

export type KanbanStatus =
  | "wishlist"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export async function getApplicationsByUser(clerkUserId: string) {
  return prisma.application.findMany({
    where: { userId: clerkUserId },
    include: {
      job: {
        select: {
          title: true,
          company: true,
          location: true,
          salaryRange: true,
        },
      },
      resume: { select: { name: true, atsScore: true } },
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function updateApplicationStatus(
  id: string,
  clerkUserId: string,
  status: KanbanStatus,
  data?: { notes?: string; interviewDate?: Date; nextStep?: string }
) {
  const app = await prisma.application.findFirst({
    where: { id, userId: clerkUserId },
  });
  if (!app) throw new Error("Application not found or unauthorized");

  return prisma.application.update({
    where: { id },
    data: { status, ...data },
  });
}

// ─── Create JobPosting (manual entry) ────────────────────────────────────────

export async function createJobPosting(data: {
  title: string;
  company: string;
  description: string;
  requirements?: object;
  location?: string;
  salaryRange?: string;
}) {
  return prisma.jobPosting.create({
    data: {
      title: data.title,
      company: data.company,
      description: data.description,
      requirements: data.requirements ?? {},
      location: data.location,
      salaryRange: data.salaryRange,
    },
  });
}

// ─── Kanban Board Data ────────────────────────────────────────────────────────

export type KanbanBoard = Record<
  KanbanStatus,
  Awaited<ReturnType<typeof getApplicationsByUser>>
>;

export async function getKanbanBoard(clerkUserId: string): Promise<KanbanBoard> {
  const apps = await getApplicationsByUser(clerkUserId);

  const board: KanbanBoard = {
    wishlist: [],
    applied: [],
    interview: [],
    offer: [],
    rejected: [],
  };

  for (const app of apps) {
    const status = app.status as KanbanStatus;
    if (board[status]) {
      board[status].push(app);
    }
  }

  return board;
}
