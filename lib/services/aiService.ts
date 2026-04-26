import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groqClient = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const FAST_MODEL = groqClient("llama-3.3-70b-versatile");
const QUICK_MODEL = groqClient("llama-3.1-8b-instant");

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const resumeAnalysisSchema = z.object({
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
  extractedSkills: z.array(z.string()),
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

// ─── Helper ───────────────────────────────────────────────────────────────────

function parseJSON<T>(text: string): T {
  const clean = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(clean) as T;
}

// ─── Resume Analysis ──────────────────────────────────────────────────────────

export async function analyzeResume(parsedText: string): Promise<ResumeAnalysis> {
  const { text } = await generateText({
    model: FAST_MODEL,
    temperature: 0.3,
    prompt: `You are an expert ATS resume optimizer. Analyze this resume and return ONLY a valid JSON object with NO markdown and NO extra text.

Resume:
"""
${parsedText.slice(0, 6000)}
"""

Return exactly this JSON structure:
{
  "atsScore": <number 0-100>,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "keywordSuggestions": ["..."],
  "improvedBullets": [{"original": "...", "improved": "...", "reason": "..."}],
  "missingSkills": ["..."],
  "overallFeedback": "...",
  "extractedSkills": ["..."]
}`,
  });

  return parseJSON<ResumeAnalysis>(text);
}

// ─── Job Match Analysis ───────────────────────────────────────────────────────

export async function analyzeJobMatch(
  resumeText: string,
  jobDescription: string,
  jobTitle: string
): Promise<JobMatch> {
  const { text } = await generateText({
    model: FAST_MODEL,
    temperature: 0.2,
    prompt: `You are an expert recruiter. Compare this resume against the job description. Return ONLY valid JSON with NO markdown.

Job Title: ${jobTitle}
Job Description: """${jobDescription.slice(0, 3000)}"""
Resume: """${resumeText.slice(0, 4000)}"""

Return exactly:
{
  "matchScore": <number 0-100>,
  "matchReasons": ["..."],
  "missingRequirements": ["..."],
  "presentRequirements": ["..."],
  "improvementSuggestions": ["..."],
  "whyYouMatch": "..."
}`,
  });

  return parseJSON<JobMatch>(text);
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
  const { text } = await generateText({
    model: QUICK_MODEL,
    temperature: 0.7,
    prompt: `You are an interviewer at ${params.company || "a top tech company"}.
Generate ONE interview question for a ${params.jobTitle} position.
Difficulty: ${params.difficulty}, Category: ${params.category}
${params.previousQuestion ? `Previous Q: "${params.previousQuestion}" | Previous A: "${params.previousAnswer?.slice(0, 300)}"` : ""}
Return ONLY valid JSON:
{"question": "...", "type": "behavioral|technical|situational", "hint": "..."}`,
  });

  return parseJSON<{ question: string; type: string; hint: string }>(text);
}

// ─── Interview Evaluation ─────────────────────────────────────────────────────

export async function evaluateInterview(
  transcript: Array<{ question: string; answer: string }>,
  jobTitle: string
): Promise<InterviewEval> {
  const transcriptText = transcript
    .map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}`)
    .join("\n\n");

  const { text } = await generateText({
    model: FAST_MODEL,
    temperature: 0.3,
    prompt: `You are an expert interview coach. Evaluate this mock interview for a ${jobTitle} position. Return ONLY valid JSON with NO markdown.

Transcript:
"""
${transcriptText.slice(0, 6000)}
"""

Return exactly:
{
  "overallScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "starMethodScore": <0-100>,
  "confidenceScore": <0-100>,
  "strengths": ["..."],
  "areasToImprove": ["..."],
  "detailedFeedback": "...",
  "nextSteps": ["..."]
}`,
  });

  return parseJSON<InterviewEval>(text);
}

// ─── AI Career Coach ──────────────────────────────────────────────────────────

export async function getCoachResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userContext?: { jobTitle?: string; skills?: string[] }
): Promise<string> {
  const { text } = await generateText({
    model: QUICK_MODEL,
    system: `You are HirePilot's AI Career Coach — expert in resume optimization, interview prep, salary negotiation, and career growth.
${userContext?.skills?.length ? `User skills: ${userContext.skills.slice(0, 10).join(", ")}` : ""}
Be concise, actionable, and encouraging. Keep responses under 300 words.`,
    messages,
    temperature: 0.6,
    maxOutputTokens: 600,
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
  const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "literally", "actually", "honestly", "right", "so", "well"];
  const lower = transcript.toLowerCase();
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const estimatedDurationSec = Math.round((wordCount / 130) * 60);
  const speakingPaceWpm = estimatedDurationSec > 0 ? Math.round((wordCount / estimatedDurationSec) * 60) : 0;

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