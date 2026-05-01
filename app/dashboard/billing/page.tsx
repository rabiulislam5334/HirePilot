'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Check, Zap, Crown, Sparkles, CreditCard,
  Shield, ArrowRight, Loader2, X
} from 'lucide-react';
import { toast } from 'sonner';


const PLANS = [
  {
    id:    'free',
    name:  'Free',
    price: 0,
    icon:  Zap,
    color: 'slate',
    features: [
      '3 resume uploads',
      '5 mock interviews/month',
      'Basic ATS scoring',
      'AI Coach (10 messages/day)',
      'Job search',
      'Leaderboard access',
    ],
    missing: [
      'Unlimited interviews',
      'Advanced analytics',
      'Priority AI responses',
      'Resume templates',
    ],
  },
  {
    id:       'pro',
    name:     'Pro',
    price:    19,
    icon:     Crown,
    color:    'emerald',
    popular:  true,
    features: [
      'Unlimited resume uploads',
      'Unlimited mock interviews',
      'Advanced ATS scoring',
      'AI Coach (unlimited)',
      'Job search + AI matching',
      'Leaderboard + badges',
      'Advanced analytics',
      'Priority AI responses',
      'Resume templates',
      'Cover letter generator',
    ],
    missing: [],
  },
  {
    id:    'team',
    name:  'Team',
    price: 49,
    icon:  Sparkles,
    color: 'violet',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Team leaderboard',
      'Admin dashboard',
      'Shared question bank',
      'Priority support',
    ],
    missing: [],
  },
];

export default function BillingPage() {
  const { user } = useUser();
  const [billing, setBilling]     = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const currentPlan = 'free'; // This would come from DB

  async function handleUpgrade(planId: string) {
    if (planId === 'free') return;
    setIsLoading(planId);

    // Stripe checkout — coming soon
    await new Promise(r => setTimeout(r, 1000));
    toast.info('Stripe integration coming soon! Contact us to upgrade manually.');
    setIsLoading(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-1">Billing & Plans</h1>
        <p className="text-slate-500">Choose the plan that fits your career goals</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Plan</p>
            <p className="text-xl font-black text-slate-900">Free Plan</p>
            <p className="text-sm text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-emerald-700">Active</span>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-bold ${billing === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
        <button onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-14 h-7 rounded-full transition-all ${billing === 'yearly' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
          <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full shadow transition-all ${billing === 'yearly' ? 'left-9' : 'left-1.5'}`} />
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${billing === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Yearly</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black">Save 20%</span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const price = billing === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
          const isCurrent = plan.id === currentPlan;
          const PlanIcon = plan.icon;

          return (
            <div key={plan.id}
              className={`bg-white rounded-3xl border-2 p-6 relative transition-all ${
                plan.popular
                  ? 'border-emerald-500 shadow-xl shadow-emerald-100'
                  : 'border-slate-200'
              }`}>

              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-black rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                  plan.color === 'emerald' ? 'bg-emerald-100' :
                  plan.color === 'violet'  ? 'bg-violet-100' : 'bg-slate-100'
                }`}>
                  <PlanIcon className={`w-6 h-6 ${
                    plan.color === 'emerald' ? 'text-emerald-600' :
                    plan.color === 'violet'  ? 'text-violet-600' : 'text-slate-600'
                  }`} />
                </div>
                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-slate-900">${price}</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                {billing === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">Billed ${price * 12}/year</p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span className="text-slate-400">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || isLoading === plan.id}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : plan.popular
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                    : 'bg-slate-900 text-white hover:bg-slate-700'
                }`}>
                {isLoading === plan.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : isCurrent ? (
                  'Current Plan'
                ) : (
                  <>Upgrade to {plan.name} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
        <Shield className="w-4 h-4" />
        <span>Secure payments powered by Stripe · Cancel anytime · No hidden fees</span>
        <CreditCard className="w-4 h-4" />
      </div>
    </div>
  );
}