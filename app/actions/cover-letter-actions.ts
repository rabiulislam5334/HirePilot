"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = groq("llama-3.3-70b-versatile");

type GenerateParams = {
  resumeId: string;
  jobTitle: string;
  company: string;
  jobDesc?: string;
  tone: string;
  template: string;
};

export async function generateCoverLetter(params: GenerateParams) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  try {
    const resume = await prisma.resume.findFirst({
      where: { id: params.resumeId, userId },
      select: { parsedText: true, skills: true },
    });

    if (!resume?.parsedText) {
      return { success: false as const, error: "Resume not found" };
    }

    const templateInstructions = {
      standard:    "Write a classic professional cover letter with an introduction, body, and closing.",
      story:       "Open with a compelling 2-sentence story or achievement that grabs attention, then transition to qualifications.",
      achievement: "Lead with 2-3 specific quantified achievements from the resume, then connect them to the role.",
    }[params.template] ?? "";

    const { text } = await generateText({
      model: MODEL,
      temperature: 0.7,
      maxOutputTokens: 800,
      prompt: `You are an expert career coach and professional writer.

Write a ${params.tone.toLowerCase()} cover letter for:
- Position: ${params.jobTitle}
- Company: ${params.company}
- Tone: ${params.tone}
- Style: ${templateInstructions}

Candidate's resume summary:
"""
${resume.parsedText.slice(0, 3000)}
"""

${params.jobDesc ? `Job Description:\n"""\n${params.jobDesc.slice(0, 2000)}\n"""` : ''}

Requirements:
- 3-4 paragraphs, 250-350 words
- Specific, personalized — no generic phrases
- Reference actual skills and experience from resume
- End with a clear call to action
- Do NOT include address blocks or date headers
- Start directly with "Dear Hiring Manager," or "Dear [Company] Team,"`,
    });

    return { success: true as const, letter: text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return { success: false as const, error: message };
  }
}
