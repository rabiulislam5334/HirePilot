'use client';

import { motion } from 'framer-motion';
import { Check, Rocket, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: "Starter",
    price: "0",
    desc: "Test the waters with basic AI career tools.",
    features: [
      "3 AI Resume Optimizations",
      "2 Mock Interview Sessions",
      "Basic Speech Analysis",
      "Standard Job Tracker"
    ],
    isPopular: false,
    cta: "Start for Free",
    icon: <Rocket className="w-5 h-5" />
  },
  {
    name: "Pro Pilot",
    price: "19",
    desc: "Complete toolkit for active job seekers.",
    features: [
      "Unlimited Resume Optimizations",
      "Unlimited Adaptive Interviews",
      "Advanced STAR Evaluation",
      "Filler Word & Pace Analysis",
      "Priority AI Coach Access"
    ],
    isPopular: true,
    cta: "Get Pro Access",
    icon: <Zap className="w-5 h-5" />
  },
  {
    name: "Elite",
    price: "49",
    desc: "For those targeting Tier-1 tech companies.",
    features: [
      "Everything in Pro",
      "Company-Specific Prep Mode",
      "Real-time Interview Copilot",
      "Salary Negotiation Coaching",
      "Lifetime Community Access"
    ],
    isPopular: false,
    cta: "Go Elite",
    icon: <Crown className="w-5 h-5" />
  }
];

export default function Pricing() {
  return (
    <section className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Invest in Your <span className="text-emerald-600">Future.</span>
          </motion.h2>
          <p className="text-slate-500 text-lg">Choose the perfect plan to accelerate your career growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl ${
                plan.isPopular 
                ? 'bg-slate-900 text-white border-slate-800 shadow-xl scale-105 z-10' 
                : 'bg-white text-slate-900 border-slate-100 shadow-sm'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.isPopular ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className={plan.isPopular ? 'text-slate-400' : 'text-slate-500'}>/month</span>
                </div>
                <p className={`text-sm h-10 ${plan.isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.desc}
                </p>
              </div>

              <div className="space-y-4 mb-10 min-h-[200px]">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 mt-0.5 ${plan.isPopular ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-sm ${plan.isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button 
                className={`w-full h-14 rounded-2xl font-bold transition-all ${
                  plan.isPopular 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}