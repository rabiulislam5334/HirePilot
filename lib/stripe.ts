import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia" as any,
    })
  : null;

export const PLANS = {
  free: {
    name:    "Free",
    price:   0,
    priceId: null,
  },
  pro: {
    name:        "Pro",
    price:       19,
    priceId:     process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
    priceYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID  ?? null,
  },
} as const;

export type PlanId = keyof typeof PLANS;