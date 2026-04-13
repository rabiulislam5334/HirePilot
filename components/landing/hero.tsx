'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  // Animation Variants for cleaner code
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Decorative Elements - High End Look */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-200/20 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Badge */}
        <motion.div 
          {...fadeInUp}
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            AI-Powered Career OS
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.85]"
        >
          Land Your Dream Job <br /> 
          <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent italic">
            10x Faster.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          HirePilot helps you optimize resumes with AI, practice realistic voice interviews, 
          and track applications in one unified, high-performance dashboard.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <Link href="/sign-up">
            <Button size="lg" className="bg-slate-900 hover:bg-emerald-600 text-white text-lg h-16 px-10 rounded-2xl group transition-all duration-300 shadow-xl shadow-emerald-500/10">
              Get Started Free 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
            <Play className="w-4 h-4 fill-current" /> Watch Demo
          </Button>
        </motion.div>

        {/* Stats / Proof Mini Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-8 text-slate-400 font-medium text-sm"
        >
          <p>ATS-Optimized</p>
          <p>Real-time Feedback</p>
          <p>24/7 AI Coach</p>
        </motion.div>
      </div>
    </section>
  );
}