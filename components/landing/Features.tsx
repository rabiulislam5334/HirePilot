'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Target, 
  Mic2, 
  MessageSquare, 
  Trophy, 
  LayoutDashboard, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';

const FEATURE_DATA = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "AI Resume Intelligence",
    desc: "PDF parsing, ATS compatibility scoring, and AI-driven bullet point rewriting to beat the bots.",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Smart Job Match Engine",
    desc: "Semantic matching with match percentage and detailed skill gap analysis for specific roles.",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    icon: <Mic2 className="w-6 h-6" />,
    title: "Adaptive Mock Interviews",
    desc: "Voice-based AI interviews that adjust difficulty dynamically based on your responses.",
    color: "text-violet-600",
    bg: "bg-violet-50"
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Communication Analysis",
    desc: "Real-time feedback on filler words, speaking pace, clarity, and confidence levels.",
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI Interview Evaluation",
    desc: "Detailed scoring using the STAR method with personalized feedback for every session.",
    color: "text-rose-600",
    bg: "bg-rose-50"
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Real-time Leaderboard",
    desc: "Gamified career progress with global rankings and achievement badges to keep you motivated.",
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "Smart Application Tracker",
    desc: "Kanban-style pipeline to manage job applications, interviews, and follow-ups in one place.",
    color: "text-cyan-600",
    bg: "bg-cyan-50"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Analytics Dashboard",
    desc: "Visualize your growth with weakness heatmaps and score trends over time.",
    color: "text-orange-600",
    bg: "bg-orange-50"
  }
];

export default function Features() {
  return (
    <section className="py-32 px-6 bg-slate-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6"
          >
            A Complete AI Career Intelligence Ecosystem
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500"
          >
            Everything you need to optimize your resume, master interviews, and land your dream job with AI-powered insights.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_DATA.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}