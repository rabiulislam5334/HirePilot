"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { extractText } from "unpdf";
import prisma from "@/lib/prisma";
import {
  createResume,
  getResumesByUser,
  getResumeById,
  runResumeAIAnalysis,
  deleteResume,
  getResumeDashboardStats,
} from "@/lib/services/resumeService";

// User কে Account table এ sync করে
async function ensureAccount(userId: string) {
  const user = await currentUser();
  if (!user) return;

  await prisma.account.upsert({
    where: { clerkId: userId },
    update: {
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
      image: user.imageUrl ?? null,
    },
    create: {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
      image: user.imageUrl ?? null,
    },
  });
}

export async function uploadAndParseResume(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Account sync — Resume foreign key এর জন্য দরকার
    await ensureAccount(userId);

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file uploaded" };
    if (file.type !== "application/pdf")
      return { success: false, error: "Only PDF files are allowed" };
    if (file.size > 5 * 1024 * 1024)
      return { success: false, error: "File too large (max 5MB)" };

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    const { text } = await extractText(buffer, { mergePages: true });
    const parsedText = text.trim();

    if (!parsedText || parsedText.length < 50) {
      return { success: false, error: "Could not extract text from PDF. Try a text-based PDF." };
    }

    const resume = await createResume({
      clerkUserId: userId,
      parsedText,
      originalFileName: file.name,
      name: file.name.replace(/\.pdf$/i, ""),
    });

    revalidatePath("/dashboard/resumes");

    return {
      success: true,
      resumeId: resume.id,
      preview: parsedText.substring(0, 300) + "…",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[action] uploadAndParseResume:", err);
    return { success: false, error: message };
  }
}

export async function analyzeResumeWithAI(resumeId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const result = await runResumeAIAnalysis(resumeId, userId);
    if (result.success) revalidatePath("/dashboard/resumes");
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI analysis failed";
    console.error("[action] analyzeResumeWithAI:", err);
    return { success: false, error: message };
  }
}

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

export async function deleteMyResume(resumeId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };
    await deleteResume(resumeId, userId);
    revalidatePath("/dashboard/resumes");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return { success: false, error: message };
  }
}