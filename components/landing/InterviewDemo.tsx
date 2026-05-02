'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, BarChart2, MessageSquare, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InterviewDemo() {
  const [isListening, setIsListening] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      question: "Can you describe a challenging technical problem you solved recently?",
      aiHint: "Focus on the STAR method: Situation, Task, Action, Result.",
    },
    {
      question: "How do you handle conflict within a development team?",
      aiHint: "Emphasize communication and professional resolution strategies.",
    }
  ];

  return (
    <section className="py-24 px-6 bg-white text-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Content */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full text-emerald-600 text-xs font-bold uppercase tracking-widest"
          >
            <ShieldCheck className="w-4 h-4" /> Adaptive Voice Engine
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black leading-tight text-slate-900"
          >
            Practice Interviews <br />
            <span className="text-emerald-500">In Real-Time.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg max-w-lg"
          >
            Experience dynamic interviews where AI follow-ups adjust to your answers, analyzing your speech pace and confidence.
          </motion.p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-emerald-500"><MessageSquare className="w-5 h-5"/></div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Adaptive Q&A</h4>
                <p className="text-xs text-slate-400">AI adjusts difficulty on the fly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-emerald-500"><BarChart2 className="w-5 h-5"/></div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Yoodli Analysis</h4>
                <p className="text-xs text-slate-400">Filler words & pace detection.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Mock UI */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 shadow-lg"
        >
          {/* Interviewer UI */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-xl text-white">H</div>
              <div>
                <h3 className="font-bold text-slate-800">HirePilot AI</h3>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Interview Session
                </p>
              </div>
            </div>

            <div className="min-h-[150px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-xl font-medium text-slate-700 leading-relaxed italic">
                    "{demoSteps[activeStep].question}"
                  </p>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <p className="text-xs text-emerald-600 font-medium">💡 Pro-Tip: {demoSteps[activeStep].aiHint}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Visualizer & Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-6">
              <div className="flex gap-1 items-end h-12">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={isListening ? { height: [10, 40, 15, 30, 10] } : { height: 4 }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1.5 bg-emerald-400 rounded-full"
                  />
                ))}
              </div>

              <div className="flex gap-4">
                <Button 
                  size="lg"
                  onClick={() => setIsListening(!isListening)}
                  className={`h-16 w-16 rounded-full transition-all relative ${
                    isListening 
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.2)]' 
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                  {isListening && (
                    <motion.div 
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-rose-400 rounded-full -z-10"
                    />
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setActiveStep((prev) => (prev + 1) % demoSteps.length)}
                  className="h-16 px-8 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                >
                  Next Question
                </Button>
              </div>

              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                {isListening ? "Listening and analyzing your response..." : "Click mic to start practice"} 
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}