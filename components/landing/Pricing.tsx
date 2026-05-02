'use client';

import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id:       'free',
    name:     'Free',
    price:    0,
    icon:     Zap,
    gradient: 'from-slate-50 to-white',
    iconBg:   'bg-slate-100',
    iconColor:'text-slate-500',
    popular:  false,
    cta:      'Get Started Free',
    btnClass: 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200',
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
    name:        'Pro Pilot',
    price:       19,
    icon:        Crown,
    popular:     true,
    gradient:    'from-[#10a37f]/8 to-[#d1fae5]/30',
    iconBg:      'bg-[#10a37f]/10',
    iconColor:   'text-[#10a37f]',
    borderColor: 'border-[#10a37f]',
    cta:         'Get Pro Access',
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
    id:       'elite',
    name:     'Elite',
    price:    49,
    icon:     Sparkles,
    popular:  false,
    gradient: 'from-violet-50/60 via-purple-50/40 to-pink-50/20',
    iconBg:   'bg-gradient-to-br from-violet-100 to-purple-100',
    iconColor:'text-violet-500',
    cta:      'Go Elite',
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

export default function Pricing() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Invest in Your <span className="text-emerald-500">Future.</span>
          </motion.h2>
          <p className="text-slate-500 text-lg">Choose the perfect plan to accelerate your career growth.</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const PlanIcon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${plan.gradient} rounded-3xl border-2 p-6 relative transition-all hover:shadow-lg ${
                  plan.popular
                    ? `${(plan as { borderColor?: string }).borderColor ?? 'border-[#10a37f]'} shadow-lg`
                    : 'border-slate-200'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#10a37f] text-white text-xs font-black rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                {/* Icon + Name + Price */}
                <div className="mb-6">
                  <div className={`w-12 h-12 ${plan.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                    <PlanIcon className={`w-6 h-6 ${plan.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>
                </div>

                {/* Features */}
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

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${plan.btnClass}`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}