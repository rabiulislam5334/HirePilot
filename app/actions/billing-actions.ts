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

export async function createCheckoutSession(priceId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ priceId }),
    }
  );

  const data = await res.json();
  return data as { url?: string; error?: string };
}

export async function openCustomerPortal() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/portal`,
    { method: "POST" }
  );

  const data = await res.json();
  return data as { url?: string; error?: string };
}