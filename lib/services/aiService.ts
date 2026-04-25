import { generateObject, generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const resumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100).describe("ATS compatibility score"),
  strengths: z.array(z.string()).describe("Strong points in the resume"),
  weaknesses: z.array(z.string()).describe("Areas that need improvement"),
  keywordSuggestions: z
    .array(z.string())
    .describe("Important keywords missing from resume"),
  improvedBullets: z
    .array(
      z.object({
        original: z.string(),
        improved: z.string(),
        reason: z.string(),
      })
    )
    .describe("4-6 bullet points rewritten with stronger action verbs and metrics"),
  missingSkills: z.array(z.string()).describe("Skills likely missing for modern jobs"),
  overallFeedback: z.string().describe("Constructive paragraph of overall feedback"),
  extractedSkills: z.array(z.string()).describe("Skills detected in the resume"),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export const jobMatchSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchReasons: z.array(z.string()),
  missingRequirements: z.array(z.string()),
  presentRequirements: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  whyYouMatch: z.string(),
});

export type JobMatch = z.infer<typeof jobMatchSchema>;

export const interviewEvalSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  starMethodScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  areasToImprove: z.array(z.string()),
  detailedFeedback: z.string(),
  nextSteps: z.array(z.string()),
});

export type InterviewEval = z.infer<typeof interviewEvalSchema>;

// ─── Models ───────────────────────────────────────────────────────────────────

// llama-3.3-70b-versatile — best free Groq model for structured output
const FAST_MODEL = groq("llama-3.3-70b-versatile");
// llama3-8b-8192 — faster, for simple tasks like follow-up questions
const QUICK_MODEL = groq("llama3-8b-8192");

// ─── Resume Analysis ──────────────────────────────────────────────────────────

export async function analyzeResume(parsedText: string): Promise<ResumeAnalysis> {
  const { object } = await generateObject({
    model: FAST_MODEL,
    schema: resumeAnalysisSchema,
    temperature: 0.3,
    prompt: `You are an expert ATS resume optimizer and career coach.

Analyze this resume and provide a detailed assessment:

"""
${parsedText.slice(0, 6000)}
"""

Be specific and actionable. For improvedBullets, use strong action verbs and add quantified metrics where possible.
Return only valid JSON matching the schema.`,
  });

  return object;
}

// ─── Job Match Analysis ───────────────────────────────────────────────────────

export async function analyzeJobMatch(
  resumeText: string,
  jobDescription: string,
  jobTitle: string
): Promise<JobMatch> {
  const { object } = await generateObject({
    model: FAST_MODEL,
    schema: jobMatchSchema,
    temperature: 0.2,
    prompt: `You are an expert recruiter and career coach.

Compare this resume against the job description and provide a detailed match analysis.

Job Title: ${jobTitle}

Job Description:
"""
${jobDescription.slice(0, 3000)}
"""

Resume:
"""
${resumeText.slice(0, 4000)}
"""

Be specific about what matches and what doesn't. The whyYouMatch field should be a compelling 2-3 sentence summary.`,
  });

  return object;
}

// ─── Interview Question Generator ─────────────────────────────────────────────

export async function generateInterviewQuestions(params: {
  jobTitle: string;
  company?: string;
  category: "behavioral" | "technical" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  previousAnswer?: string;
  previousQuestion?: string;
}): Promise<{ question: string; type: string; hint: string }> {
  const { object } = await generateObject({
    model: QUICK_MODEL,
    schema: z.object({
      question: z.string(),
      type: z.enum(["behavioral", "technical", "situational"]),
      hint: z.string().describe("A brief hint on what a good answer includes"),
    }),
    temperature: 0.7,
    prompt: `You are an experienced interviewer at ${params.company || "a top tech company"}.

Generate ONE interview question for a ${params.jobTitle} position.
Difficulty: ${params.difficulty}
Category: ${params.category}

${
  params.previousQuestion
    ? `Previous question: "${params.previousQuestion}"
Previous answer: "${params.previousAnswer?.slice(0, 500)}"
Generate a relevant follow-up OR a new question on a different topic.`
    : "Start with an opening question."
}

Make the question realistic and specific to the role.`,
  });

  return object;
}

// ─── Interview Evaluation ─────────────────────────────────────────────────────

export async function evaluateInterview(
  transcript: Array<{ question: string; answer: string }>,
  jobTitle: string
): Promise<InterviewEval> {
  const transcriptText = transcript
    .map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}`)
    .join("\n\n");

  const { object } = await generateObject({
    model: FAST_MODEL,
    schema: interviewEvalSchema,
    temperature: 0.3,
    prompt: `You are an expert interview coach evaluating a mock interview for a ${jobTitle} position.

Full interview transcript:
"""
${transcriptText.slice(0, 6000)}
"""

Evaluate the candidate holistically. Check for:
- STAR method usage in behavioral questions
- Technical accuracy and depth
- Communication clarity
- Confidence and structure
- Completeness of answers

Provide specific, actionable feedback with concrete examples from their answers.`,
  });

  return object;
}

// ─── AI Career Coach ──────────────────────────────────────────────────────────

export async function getCoachResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userContext?: { jobTitle?: string; skills?: string[] }
): Promise<string> {
  const systemPrompt = `You are HirePilot's AI Career Coach — an expert in resume optimization, interview preparation, salary negotiation, and career growth.

${
  userContext?.jobTitle
    ? `The user is targeting: ${userContext.jobTitle} roles.`
    : ""
}
${
  userContext?.skills?.length
    ? `Their skills include: ${userContext.skills.slice(0, 10).join(", ")}.`
    : ""
}

Be concise, actionable, and encouraging. Use bullet points when listing steps. Keep responses under 300 words unless the user asks for detail.`;

  const { text } = await generateText({
    model: QUICK_MODEL,
    system: systemPrompt,
    messages,
    temperature: 0.6,
    maxTokens: 600,
  });

  return text;
}

// ─── Communication Analysis ───────────────────────────────────────────────────

export function analyzeTranscriptLocally(transcript: string): {
  fillerWordCount: number;
  fillerWords: Record<string, number>;
  wordCount: number;
  estimatedDurationSec: number;
  speakingPaceWpm: number;
} {
  const FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "literally",
    "actually", "honestly", "right", "so", "well", "kind of", "sort of",
  ];

  const lower = transcript.toLowerCase();
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const estimatedDurationSec = Math.round((wordCount / 130) * 60); // avg 130 wpm
  const speakingPaceWpm = estimatedDurationSec > 0
    ? Math.round((wordCount / estimatedDurationSec) * 60)
    : 0;

  const fillerWords: Record<string, number> = {};
  let fillerWordCount = 0;

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      fillerWords[filler] = matches.length;
      fillerWordCount += matches.length;
    }
  }

  return { fillerWordCount, fillerWords, wordCount, estimatedDurationSec, speakingPaceWpm };
}
