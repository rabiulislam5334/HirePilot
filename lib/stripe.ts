import Stripe from "stripe";

// ✅ Lazy initialization — build time এ crash করবে না
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, {
      apiVersion: "2026-04-22.dahlia" as any,
      typescript: true,
    });
  }
  return _stripe;
}

// backward compatibility এর জন্য — পুরনো import গুলো কাজ করবে
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  }
});

export const PLANS = {
  free: {
    name:    "Free",
    price:   0,
    priceId: null,
  },
  pro: {
    name:        "Pro",
    price:       19,
    priceId:     process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    priceYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID  ?? '',
  },
} as const;

export type PlanId = keyof typeof PLANS;