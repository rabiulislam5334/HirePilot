"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function fetchNotifications() {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma.notification.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    take:    50,
  });
}

export async function markAsRead(id: string) {
  const { userId } = await auth();
  if (!userId) return;

  await prisma.notification.updateMany({
    where: { id, userId },
    data:  { isRead: true },
  });
}

export async function markAllAsRead() {
  const { userId } = await auth();
  if (!userId) return;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });
}

export async function deleteNotification(id: string) {
  const { userId } = await auth();
  if (!userId) return;

  await prisma.notification.deleteMany({
    where: { id, userId },
  });
}

// Server actions থেকে notification তৈরি করার helper
export async function createNotification(params: {
  userId: string;
  type: 'interview' | 'resume' | 'leaderboard' | 'job' | 'coach' | 'system';
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId:  params.userId,
      type:    params.type,
      title:   params.title,
      message: params.message,
      link:    params.link,
      isRead:  false,
    },
  });
}
