// app/actions/resume-ai-actions.ts
"use server";

import prisma from "@/lib/prisma"; // ✅ default import
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
// ✅ aiService থেকে import — duplicate code এড়ানো হলো
import { analyzeResume } from "@/lib/services/aiService";

export async function analyzeResumeWithAI(resumeId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }, // ✅ ownership check
    });

    if (!resume?.parsedText) {
      return { success: false, error: "Resume not found or no text extracted" };
    }

    const object = await analyzeResume(resume.parsedText);

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        atsScore: object.atsScore,
        skills: object.extractedSkills,
        jsonData: object as object,
        feedback: object.overallFeedback,
      },
    });

    revalidatePath("/dashboard/resumes");

    return { success: true, data: object };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to analyze resume with AI";
    console.error("AI Analysis Error:", err);
    return { success: false, error: message };
  }
}