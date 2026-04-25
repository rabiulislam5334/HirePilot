"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCoachResponse } from "@/lib/services/aiService";

export async function sendCoachMessage(message: string) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  try {
    // Save user message
    await prisma.coachChat.create({
      data: { userId, role: "user", content: message },
    });

    // Fetch last 10 messages for context
    const history = await prisma.coachChat.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });

    // Get user skills for context
    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { skills: true, feedback: true },
    });

    const response = await getCoachResponse(
      history as Array<{ role: "user" | "assistant"; content: string }>,
      { skills: latestResume?.skills }
    );

    // Save assistant reply
    await prisma.coachChat.create({
      data: { userId, role: "assistant", content: response },
    });

    return { success: true as const, response };
  } catch (err: any) {
    console.error("[coachAction]", err);
    return { success: false as const, error: err.message ?? "Coach unavailable" };
  }
}

export async function fetchChatHistory() {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma.coachChat.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });
}

export async function clearChatHistory() {
  const { userId } = await auth();
  if (!userId) return;
  await prisma.coachChat.deleteMany({ where: { userId } });
}
