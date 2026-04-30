// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { priceId, billing } = await req.json();
    if (!priceId) return NextResponse.json({ error: "Price ID required" }, { status: 400 });

    const user = await currentUser();
    const account = await prisma.account.findFirst({
      where: { clerkId: userId },
    });

    // Stripe customer তৈরি বা existing নাও
    let customerId = account?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.primaryEmailAddress?.emailAddress ?? "",
        name:  user?.fullName ?? "",
        metadata: { clerkId: userId },
      });
      customerId = customer.id;

      await prisma.account.update({
        where: { clerkId: userId },
        data:  { stripeCustomerId: customerId },
      });
    }

    // Checkout session তৈরি
    const session = await stripe.checkout.sessions.create({
      customer:             customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode:                 "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata:    { clerkId: userId },
      subscription_data: {
        metadata: { clerkId: userId },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}