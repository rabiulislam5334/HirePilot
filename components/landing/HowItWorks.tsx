'use client';

import { motion } from 'framer-motion';
import { Upload, Mic, BarChart3, Rocket } from 'lucide-react';

const STEPS = [
  {
    icon: <Upload className="w-8 h-8" />,
    title: "Upload & Optimize",
    desc: "Upload your PDF resume to receive an instant ATS compatibility score and AI-driven improvement suggestions.",
    color: "bg-blue-600"
  },
  {
    icon: <Mic className="w-8 h-8" />,
    title: "Adaptive Interview",
    desc: "Experience realistic voice interviews where our AI generates dynamic follow-up questions based on your responses.",
    color: "bg-emerald-600"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "AI Evaluation",
    desc: "Get a comprehensive analysis of your speech, confidence, and technical accuracy using the STAR method.",
    color: "bg-violet-600"
  },
  {
    icon: <Rocket className="w-8 h-8" />,
    title: "Track & Succeed",
    desc: "Monitor your application pipeline and use AI insights to land your dream job at top-tier companies.",
    color: "bg-orange-600"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            How HirePilot Works
          </motion.h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Your journey from a basic resume to a dream job offer, powered by advanced AI career intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-16 left-0 w-full h-0.5 bg-slate-100 -z-10" />

          {STEPS.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative text-center group"
            >
              <div className="flex justify-center mb-8">
                <div className={`w-20 h-20 rounded-3xl ${step.color} text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-0`}>
                  {step.icon}
                </div>
                {/* Step Number Badge */}
                <div className="absolute top-0 right-1/2 translate-x-12 bg-white border-4 border-slate-50 w-10 h-10 rounded-full flex items-center justify-center font-black text-slate-900 shadow-sm text-xs">
                  {i + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                {step.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}