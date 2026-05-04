'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play, Star, Users, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { icon: Users,     value: '2,400+', label: 'Job Seekers' },
  { icon: Trophy,    value: '89%',    label: 'Interview Rate' },
  { icon: TrendingUp,value: '10x',    label: 'Faster Hiring' },
];

const AVATARS = [
  'https://i.pravatar.cc/40?img=1',
  'https://i.pravatar.cc/40?img=2',
  'https://i.pravatar.cc/40?img=3',
  'https://i.pravatar.cc/40?img=4',
  'https://i.pravatar.cc/40?img=5',
];

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 px-6 overflow-hidden min-h-[92vh] flex items-center">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-emerald-200/25 blur-[130px] rounded-full" />
        <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-blue-200/20 blur-[110px] rounded-full" />
        <div className="absolute top-[40%] left-[50%] w-[20%] h-[20%] bg-violet-200/15 blur-[80px] rounded-full" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      </div>

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Text Content ── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full mb-8 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                AI-Powered Career OS
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-[0.88]"
            >
              Land Your<br />
              Dream Job{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent italic">
                10x Faster.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-slate-500 max-w-xl mb-10 leading-relaxed"
            >
              HirePilot helps you optimize resumes with AI, practice realistic
              voice interviews, and track applications — all in one unified dashboard.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link href="/sign-up">
                <Button size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-base h-14 px-8 rounded-2xl group transition-all duration-300 shadow-xl shadow-emerald-500/20 font-bold">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg"
                className="h-14 px-8 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 text-base">
                <Play className="w-4 h-4 fill-current" /> Watch Demo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex items-center gap-4"
            >
              {/* Avatars */}
              <div className="flex -space-x-2">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt=""
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Loved by <span className="font-bold text-slate-700">2,400+</span> job seekers
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: Dashboard Mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/60 p-6 overflow-hidden">

              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Good morning,</p>
                  <p className="text-lg font-black text-slate-900">Rabiul 👋</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-emerald-700">Rank #1</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'ATS Score', value: '85%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Interviews', value: '12',  color: 'text-blue-600',   bg: 'bg-blue-50' },
                  { label: 'Applied',    value: '8',   color: 'text-violet-600', bg: 'bg-violet-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                  <span>Resume Strength</span><span>85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[85%] transition-all" />
                </div>
              </div>

              {/* Mini interview card */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Next session</p>
                  <p className="font-bold text-sm">Mock Interview · Senior FE</p>
                </div>
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
              </div>
            </div>

            {/* Floating badge 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-lg"
            >
              <p className="text-xs font-bold text-slate-500">AI Score</p>
              <p className="text-2xl font-black text-emerald-600">85<span className="text-sm">%</span></p>
            </motion.div>

            {/* Floating badge 2 */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2"
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-500">Leaderboard</p>
                <p className="text-sm font-black text-slate-900">Rank #1 🏆</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Bottom Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-20 pt-8 border-t border-slate-100 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}