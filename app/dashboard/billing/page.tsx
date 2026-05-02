'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Check, Zap, Crown, Sparkles, CreditCard,
  Shield, ArrowRight, Loader2, X, ExternalLink
} from 'lucide-react';
import { fetchSubscriptionStatus, openCustomerPortal } from '@/app/actions/billing-actions';
import { toast } from 'sonner';

const PLANS = [
  {
    id:       'free',
    name:     'Free',
    price:    0,
    icon:     Zap,
    gradient: 'from-slate-50 to-white',
    iconBg:   'bg-slate-100',
    iconColor:'text-slate-500',
    btnClass: 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-default',
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
    id:          'pro',
    name:        'Pro',
    price:       19,
    icon:        Crown,
    popular:     true,
    gradient:    'from-[#10a37f]/8 to-[#d1fae5]/30',
    iconBg:      'bg-[#10a37f]/10',
    iconColor:   'text-[#10a37f]',
    borderColor: 'border-[#10a37f]',
    // Light gradient button — গাঢ় না
    btnClass:    'bg-gradient-to-r from-[#10a37f]/80 to-[#34d399]/70 hover:from-[#10a37f] hover:to-[#34d399] text-white shadow-md shadow-emerald-200/60',
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
    id:       'team',
    name:     'Team',
    price:    49,
    icon:     Sparkles,
    gradient: 'from-violet-50/60 via-purple-50/40 to-pink-50/20',
    iconBg:   'bg-gradient-to-br from-violet-100 to-purple-100',
    iconColor:'text-violet-500',
    // Light gradient button — গাঢ় না
    btnClass: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-200',
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
  const [billing, setBilling]         = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading]     = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [hasStripe, setHasStripe]     = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus().then(data => {
      if (data) {
        setCurrentPlan(data.plan);
        setHasStripe(data.hasStripeAccount);
      }
    });
  }, []);

  async function handleUpgrade(plan: typeof PLANS[number]) {
    if (plan.id === 'free' || plan.id === currentPlan) return;
    setIsLoading(plan.id);

    // Demo mode — portfolio project এর জন্য
    await new Promise(r => setTimeout(r, 800));
    toast.success(`🎉 Upgraded to ${plan.name}! (Demo mode)`);
    setCurrentPlan(plan.id);
    setIsLoading(null);
  }

  async function handleManageBilling() {
    setIsLoading('portal');
    const result = await openCustomerPortal();
    if (result.url) {
      window.location.href = result.url;
    } else {
      toast.info('Billing portal — Demo mode');
      setIsLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-1">Billing & Plans</h1>
        <p className="text-slate-500">Unlock your full career potential</p>
      </div>

      {/* Current Plan */}
      <div className="bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200 rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
            <Zap className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Plan</p>
            <p className="text-xl font-black text-slate-900 capitalize">{currentPlan} Plan</p>
            <p className="text-sm text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl">
            <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-pulse" />
            <span className="text-sm font-bold text-slate-700">Active</span>
          </div>
          {hasStripe && currentPlan !== 'free' && (
            <button onClick={handleManageBilling} disabled={isLoading === 'portal'}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 transition-all">
              {isLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Manage
            </button>
          )}
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-bold ${billing === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
        <button onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-14 h-7 rounded-full transition-all ${billing === 'yearly' ? 'bg-[#10a37f]' : 'bg-slate-200'}`}>
          <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full shadow transition-all ${billing === 'yearly' ? 'left-9' : 'left-1.5'}`} />
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${billing === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Yearly</span>
          <span className="px-2 py-0.5 bg-[#10a37f]/10 text-[#10a37f] rounded-full text-xs font-black">Save 20%</span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const price     = billing === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
          const isCurrent = plan.id === currentPlan;
          const PlanIcon  = plan.icon;

          return (
            <div key={plan.id}
              className={`bg-gradient-to-br ${plan.gradient} rounded-3xl border-2 p-6 relative transition-all hover:shadow-lg ${
                plan.popular
                  ? `${(plan as { borderColor?: string }).borderColor ?? 'border-[#10a37f]'} shadow-lg`
                  : 'border-slate-200'
              }`}>

              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#10a37f] text-white text-xs font-black rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className={`w-12 h-12 ${plan.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                  <PlanIcon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>
                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-slate-900">${price}</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                {billing === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-[#10a37f] font-bold mt-1">Billed ${price * 12}/year</p>
                )}
              </div>

              <div className="space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-[#10a37f] flex-shrink-0" />
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
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrent || !!isLoading}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                    : plan.btnClass
                }`}>
                {isLoading === plan.id
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : isCurrent
                  ? <><Check className="w-4 h-4" /> Current Plan</>
                  : <>Upgrade to {plan.name} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
        <Shield className="w-4 h-4" />
        <span>Secure payments powered by Stripe · Cancel anytime · No hidden fees</span>
        <CreditCard className="w-4 h-4" />
      </div>
    </div>
  );
}