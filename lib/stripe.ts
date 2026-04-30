// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

// Plans
export const PLANS = {
  free: {
    name:    "Free",
    price:   0,
    priceId: null,
  },
  pro: {
    name:        "Pro",
    price:       19,
    priceId:     process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    priceYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  },
} as const;

export type PlanId = keyof typeof PLANS;