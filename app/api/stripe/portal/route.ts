// app/api/stripe/portal/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST() {
  // ✅ Stripe null check
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const account = await prisma.account.findFirst({
      where: { clerkId: userId },
    });

    if (!account?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   account.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Portal failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}