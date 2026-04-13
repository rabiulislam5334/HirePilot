'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

const TESTIMONIALS = [
  {
    name: "Ariful Islam",
    role: "Software Engineer at Google",
    content: "HirePilot's mock interviews are scary realistic. The AI follow-up questions pushed me to think deeper, which eventually helped me ace my real Google interview.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arif",
    company: "Google"
  },
  {
    name: "Sarah Ahmed",
    role: "Product Manager at Meta",
    content: "The ATS resume optimizer is a game changer. My response rate from recruiters went from 10% to 70% in just two weeks of using HirePilot.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    company: "Meta"
  },
  {
    name: "Tanvir Rahman",
    role: "Frontend Developer at Vercel",
    content: "Speech analysis helped me identify my filler words. I never realized how many 'ums' I was saying until HirePilot pointed it out. Highly recommended!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir",
    company: "Vercel"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Star className="w-4 h-4 fill-current" /> Success Stories
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Trusted by the world's <br /> <span className="text-emerald-600">best professionals.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative group hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
            >
              <Quote className="absolute top-8 right-8 w-10 h-10 text-slate-200 group-hover:text-emerald-200 transition-colors" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>

              <p className="text-slate-600 leading-relaxed mb-8 relative z-10">
                "{t.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-emerald-100 border-2 border-white shadow-sm">
                   <img src={t.avatar} alt={t.name} className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Mentions - Small subtle touch */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap justify-center items-center gap-12 grayscale opacity-30"
        >
           <span className="font-black text-xl tracking-tighter">GOOGLE</span>
           <span className="font-black text-xl tracking-tighter">META</span>
           <span className="font-black text-xl tracking-tighter">VERCEL</span>
           <span className="font-black text-xl tracking-tighter">MICROSOFT</span>
        </motion.div>
      </div>
    </section>
  );
}