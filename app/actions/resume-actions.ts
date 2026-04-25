"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import pdf from "pdf-parse";
import {
  createResume,
  getResumesByUser,
  getResumeById,
  runResumeAIAnalysis,
  deleteResume,
  getResumeDashboardStats,
} from "@/lib/services/resumeService";

// ─── Upload & Parse ───────────────────────────────────────────────────────────

export async function uploadAndParseResume(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file uploaded" };
    if (file.type !== "application/pdf")
      return { success: false, error: "Only PDF files are allowed" };
    if (file.size > 5 * 1024 * 1024)
      return { success: false, error: "File too large (max 5MB)" };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const data = await pdf(buffer);
    const parsedText = data.text.trim();

    if (!parsedText || parsedText.length < 50) {
      return { success: false, error: "Could not extract text from PDF. Try a text-based PDF." };
    }

    const resume = await createResume({
      clerkUserId: userId,
      parsedText,
      originalFileName: file.name,
      name: file.name.replace(".pdf", ""),
    });

    revalidatePath("/dashboard/resumes");

    return {
      success: true,
      resumeId: resume.id,
      preview: parsedText.substring(0, 300) + "…",
    };
  } catch (err: any) {
    console.error("[action] uploadAndParseResume:", err);
    return { success: false, error: err.message ?? "Upload failed" };
  }
}

// ─── Analyze with AI ──────────────────────────────────────────────────────────

export async function analyzeResumeWithAI(resumeId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const result = await runResumeAIAnalysis(resumeId, userId);

    if (result.success) {
      revalidatePath("/dashboard/resumes");
    }

    return result;
  } catch (err: any) {
    console.error("[action] analyzeResumeWithAI:", err);
    return { success: false, error: err.message ?? "AI analysis failed" };
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchMyResumes() {
  const { userId } = await auth();
  if (!userId) return [];
  return getResumesByUser(userId);
}

export async function fetchResumeById(resumeId: string) {
  const { userId } = await auth();
  if (!userId) return null;
  return getResumeById(resumeId, userId);
}

export async function fetchResumeDashboardStats() {
  const { userId } = await auth();
  if (!userId) return null;
  return getResumeDashboardStats(userId);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteMyResume(resumeId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await deleteResume(resumeId, userId);
    revalidatePath("/dashboard/resumes");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Delete failed" };
  }
}
