"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function fetchSubscriptionStatus() {
  const { userId } = await auth();
  if (!userId) return null;

  const account = await prisma.account.findFirst({
    where:  { clerkId: userId },
    select: { subscription: true, stripeCustomerId: true },
  });

  return {
    plan:             account?.subscription ?? "free",
    hasStripeAccount: !!account?.stripeCustomerId,
  };
}

// Demo mode — Stripe নেই
export async function createCheckoutSession(_priceId: string) {
  return { url: undefined, error: "Stripe not configured" };
}

export async function openCustomerPortal() {
  return { url: undefined, error: "Stripe not configured" };
}