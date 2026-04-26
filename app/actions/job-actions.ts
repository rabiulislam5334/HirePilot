"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  matchResumeToJob,
  applyToJob,
  getKanbanBoard,
  updateApplicationStatus,
  createJobPosting,
  type KanbanStatus,
} from "@/lib/services/jobMatchService";

export async function analyzeJobMatch(params: {
  resumeId: string;
  jobDescription: string;
  jobTitle: string;
  company?: string;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };
  return matchResumeToJob({ clerkUserId: userId, ...params });
}

export async function addJobAndApply(params: {
  resumeId: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  location?: string;
  salaryRange?: string;
  matchScore?: number;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  try {
    const job = await createJobPosting({
      title: params.jobTitle,
      company: params.company,
      description: params.jobDescription,
      location: params.location,
      salaryRange: params.salaryRange,
    });

    const application = await applyToJob({
      clerkUserId: userId,
      jobId: job.id,
      resumeId: params.resumeId,
      matchScore: params.matchScore,
    });

    revalidatePath("/dashboard/tracker");
    return { success: true as const, applicationId: application.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add job";
    return { success: false as const, error: message };
  }
}

export async function fetchKanbanBoard() {
  const { userId } = await auth();
  if (!userId) return null;
  return getKanbanBoard(userId);
}

export async function moveApplicationStatus(
  applicationId: string,
  status: KanbanStatus,
  data?: { notes?: string; interviewDate?: Date; nextStep?: string }
) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  try {
    await updateApplicationStatus(applicationId, userId, status, data);
    revalidatePath("/dashboard/tracker");
    return { success: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Status update failed";
    return { success: false as const, error: message };
  }
}