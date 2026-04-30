"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

type ProfileData = {
  name?: string;
  title?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  targetRoles?: string[];
  targetSalary?: string;
  experience?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  openToWork?: boolean;
  preferredWorkType?: string;
};

export async function saveUserProfile(data: ProfileData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.account.update({
      where: { clerkId: userId },
      data:  { name: data.name ?? undefined },
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save";
    return { success: false, error: message };
  }
}

export async function fetchUserProfile() {
  const { userId } = await auth();
  if (!userId) return null;

  const account = await prisma.account.findFirst({
    where:  { clerkId: userId },
    select: { name: true, email: true, image: true },
  });

  return account;
}
