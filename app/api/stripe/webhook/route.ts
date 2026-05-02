import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  // ✅ Stripe না থাকলে early return — build break হবে না
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error("[webhook] signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.log(`[webhook] event: ${event.type}`);

  try {
    switch (event.type) {

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkId      = subscription.metadata?.clerkId;
        if (!clerkId) break;

        const status = subscription.status === "active" ? "pro" : "free";
        await prisma.account.update({
          where: { clerkId },
          data:  { subscription: status },
        });
        console.log(`[webhook] user ${clerkId} → plan: ${status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkId      = subscription.metadata?.clerkId;
        if (!clerkId) break;

        await prisma.account.update({
          where: { clerkId },
          data:  { subscription: "free" },
        });
        console.log(`[webhook] user ${clerkId} → downgraded to free`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[webhook] payment succeeded: ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const subscriptionId =
          invoice.parent?.type === "subscription_details"
            ? invoice.parent.subscription_details?.subscription
            : null;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId as string
          );
          const clerkId = subscription.metadata?.clerkId;
          if (clerkId) {
            await prisma.account.update({
              where: { clerkId },
              data:  { subscription: "free" },
            });
          }
        }
        console.log(`[webhook] payment failed: ${invoice.id}`);
        break;
      }

      default:
        console.log(`[webhook] unhandled event: ${event.type}`);
    }
  } catch (err: unknown) {
    console.error("[webhook] handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}