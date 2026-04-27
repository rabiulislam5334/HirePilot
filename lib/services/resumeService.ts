// prisma.ts এ default export আছে, তাই default import করতে হবে
import prisma from "@/lib/prisma";
import { analyzeResume, type ResumeAnalysis } from "./aiService";

export async function createResume(params: {
  clerkUserId: string;
  parsedText: string;
  originalFileName: string;
  originalUrl?: string;
  name?: string;
}) {
  return prisma.resume.create({
    data: {
      userId: params.clerkUserId,
      parsedText: params.parsedText,
      originalFileName: params.originalFileName,
      originalUrl: params.originalUrl ?? "pending",
      name: params.name ?? params.originalFileName.replace(/\.pdf$/i, ""),
    },
  });
}

export async function getResumesByUser(clerkUserId: string) {
  return prisma.resume.findMany({
    where: { userId: clerkUserId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      originalFileName: true,
      atsScore: true,
      skills: true,
      feedback: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getResumeById(id: string, clerkUserId: string) {
  return prisma.resume.findFirst({
    where: { id, userId: clerkUserId },
  });
}

export async function runResumeAIAnalysis(
  resumeId: string,
  clerkUserId: string
): Promise<{ success: true; data: ResumeAnalysis } | { success: false; error: string }> {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: clerkUserId },
    });

    if (!resume?.parsedText) {
      return { success: false, error: "Resume not found or no text extracted" };
    }

    const analysis = await analyzeResume(resume.parsedText);

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        atsScore: analysis.atsScore,
        skills: analysis.extractedSkills,
        feedback: analysis.overallFeedback,
        jsonData: analysis as object,
      },
    });

    return { success: true, data: analysis };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI analysis failed";
    console.error("[resumeService] AI analysis error:", err);
    return { success: false, error: message };
  }
}

export async function deleteResume(id: string, clerkUserId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id, userId: clerkUserId },
  });
  if (!resume) throw new Error("Resume not found or unauthorized");
  return prisma.resume.delete({ where: { id } });
}

type ResumeStatRow = {
  atsScore: number | null;
  createdAt: Date;
};

export async function getResumeDashboardStats(clerkUserId: string) {
  const resumes: ResumeStatRow[] = await prisma.resume.findMany({
    where: { userId: clerkUserId },
    select: { atsScore: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const analyzed = resumes.filter((r: ResumeStatRow) => r.atsScore !== null);
  const avgScore =
    analyzed.length > 0
      ? Math.round(
          analyzed.reduce((sum: number, r: ResumeStatRow) => sum + (r.atsScore ?? 0), 0) / analyzed.length
        )
      : 0;
  const bestScore =
    analyzed.length > 0 ? Math.max(...analyzed.map((r: ResumeStatRow) => r.atsScore ?? 0)) : 0;

  return { total: resumes.length, analyzed: analyzed.length, avgScore, bestScore };
}