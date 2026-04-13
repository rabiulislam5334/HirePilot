'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
      >
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent -z-10" />

        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Ready to land your <br />
            <span className="text-emerald-500">dream job?</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Join thousands of professionals who are using HirePilot to master their interviews and accelerate their careers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="h-16 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-xl shadow-emerald-500/20">
              Get Started for Free
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-slate-700 text-white hover:bg-slate-800 font-bold text-lg">
              <Sparkles className="w-5 h-5 mr-2 text-emerald-400" />
              View Pro Features
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}