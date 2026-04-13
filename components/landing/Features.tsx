"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Target,
  Mic2,
  MessageSquare,
  Trophy,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const FEATURE_DATA = [
  {
    icon: FileText,
    title: "AI Resume Intelligence",
    desc: "PDF parsing, ATS compatibility scoring, and AI-driven bullet point rewriting.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Target,
    title: "Smart Job Match Engine",
    desc: "Semantic matching with skill gap analysis.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section className="py-32 px-6 bg-slate-50/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...fadeUp}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            A Complete AI Career Intelligence Ecosystem
          </h2>

          <p className="text-lg text-slate-500">
            Everything you need to land your dream job.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_DATA.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                {...fadeUp}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}