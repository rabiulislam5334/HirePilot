"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function fetchChatRooms() {
  const { userId } = await auth();
  if (!userId) return [];

  return [
    { id: 'general',    name: 'General',          type: 'public', unreadCount: 0 },
    { id: 'resume',     name: 'Resume Help',       type: 'public', unreadCount: 0 },
    { id: 'interviews', name: 'Interview Prep',    type: 'public', unreadCount: 0 },
    { id: 'jobs',       name: 'Job Opportunities', type: 'public', unreadCount: 0 },
  ];
}

export async function fetchMessages(roomId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  const messages = await prisma.chatMessage.findMany({
    where:   { roomId },
    orderBy: { createdAt: 'asc' },
    take:    100,
    include: {
      sender: { select: { name: true, image: true, clerkId: true } },
    },
  });

return messages.map((m: {
  id: string;
  content: string;
  createdAt: Date;
  sender: { clerkId: string; name: string | null; image: string | null };
}) => ({
  id:          m.id,
  content:     m.content,
  senderId:    m.sender.clerkId,
  senderName:  m.sender.name ?? 'Anonymous',
  senderImage: m.sender.image,
  createdAt:   m.createdAt,
}));
}

export async function sendMessage(params: { roomId: string; content: string }) {
  const { userId } = await auth();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  try {
    const user = await currentUser();

    // Account upsert
    await prisma.account.upsert({
      where:  { clerkId: userId },
      update: { name: user?.fullName ?? undefined },
      create: {
        clerkId: userId,
        email:   user?.primaryEmailAddress?.emailAddress ?? '',
        name:    user?.fullName ?? null,
        image:   user?.imageUrl ?? null,
      },
    });

    const message = await prisma.chatMessage.create({
      data: {
        roomId:   params.roomId,
        content:  params.content,
        senderId: userId,
      },
      include: {
        sender: { select: { name: true, image: true, clerkId: true } },
      },
    });

    // Socket.io emit — server.ts global._io
    if (global._io) {
      global._io.to(`chat:${params.roomId}`).emit('chat_message', {
        id:          message.id,
        content:     message.content,
        senderId:    message.sender.clerkId,
        senderName:  message.sender.name ?? 'Anonymous',
        senderImage: message.sender.image,
        createdAt:   message.createdAt,
      });
    }

    return {
      success: true as const,
      message: {
        id:          message.id,
        content:     message.content,
        senderId:    message.sender.clerkId,
        senderName:  message.sender.name ?? 'Anonymous',
        senderImage: message.sender.image,
        createdAt:   message.createdAt,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send";
    return { success: false as const, error: msg };
  }
}
