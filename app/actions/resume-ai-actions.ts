// app/actions/resume-ai-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

const resumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  keywordSuggestions: z.array(z.string()),
  improvedBullets: z.array(z.object({
    original: z.string(),
    improved: z.string(),
    reason: z.string(),
  })),
  missingSkills: z.array(z.string()),
  overallFeedback: z.string(),
});

export async function analyzeResumeWithAI(resumeId: string) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || !resume.parsedText) {
      throw new Error("Resume not found or no text extracted");
    }

    const prompt = `
You are an expert ATS resume optimizer and career coach.

Here is the raw text from a candidate's resume:

"""
${resume.parsedText}
"""

Analyze this resume and provide a detailed JSON response with the following:

- atsScore: A score from 0-100 based on ATS compatibility
- strengths: List of strong points
- weaknesses: List of areas that need improvement
- keywordSuggestions: Important keywords that should be added
- improvedBullets: 4-6 improved bullet points with original vs improved and reason
- missingSkills: Skills that are likely missing for modern jobs
- overallFeedback: A constructive paragraph of feedback

Return only valid JSON matching the schema.
`;

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),   // অথবা gemini-2.0-flash
      schema: resumeAnalysisSchema,
      prompt: prompt,
      temperature: 0.3,
    });

    // ডাটাবেজে আপডেট করো
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        atsScore: object.atsScore,
        jsonData: object,
        feedback: object.overallFeedback,
      },
    });

    return {
      success: true,
      data: object,
    };

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze resume with AI",
    };
  }
}