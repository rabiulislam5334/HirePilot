'use client';

import { useState, useEffect, useRef } from 'react';
import { Target, Mic2, Trophy, Send, ArrowUpRight, Sparkles, Play, ChevronRight, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { fetchResumeDashboardStats } from '@/app/actions/resume-actions';
import { fetchInterviewAnalytics, fetchMyRank } from '@/app/actions/interview-actions';
import { fetchKanbanBoard } from '@/app/actions/job-actions';

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = end / (duration / 16);
    ref.current = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(ref.current!); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [value]);

  return <span>{display}{suffix}</span>;
}

// ─── Minimal sparkline ───────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Stats = { resumeScore: number; interviewsDone: number; leaderboardRank: number | null; applications: number };

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [trend, setTrend]     = useState('');
  const [loaded, setLoaded]   = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const [dateStr, setDateStr]   = useState('');

  // ✅ new Date() শুধু client-side useEffect এ
  useEffect(() => {
    const now  = new Date();
    const hour = now.getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [r, i, rank, k] = await Promise.all([
          fetchResumeDashboardStats(),
          fetchInterviewAnalytics(),
          fetchMyRank(),
          fetchKanbanBoard(),
        ]);
        setStats({
          resumeScore:     r?.bestScore ?? 0,
          interviewsDone:  i?.totalSessions ?? 0,
          leaderboardRank: rank,
          applications:    k ? Object.values(k).flat().length : 0,
        });
        setTrend(i?.trend ?? '');
      } catch {
        setStats({ resumeScore: 0, interviewsDone: 0, leaderboardRank: null, applications: 0 });
      }
      setTimeout(() => setLoaded(true), 100);
    }
    load();
  }, []);

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? '#10a37f' : trend === 'declining' ? '#ef4444' : '#94a3b8';

  const cards = [
    {
      label: 'ATS Score',
      value: stats?.resumeScore ?? 0,
      suffix: '%',
      icon: Target,
      href: '/dashboard/resumes',
      accent: '#10a37f',
      spark: [40, 55, 48, 70, 65, 80, stats?.resumeScore ?? 0],
      desc: 'Resume strength',
    },
    {
      label: 'Interviews',
      value: stats?.interviewsDone ?? 0,
      suffix: '',
      icon: Mic2,
      href: '/dashboard/mock-interviews',
      accent: '#3b82f6',
      spark: [1, 3, 2, 5, 4, 7, stats?.interviewsDone ?? 0],
      desc: 'Sessions completed',
    },
    {
      label: 'Rank',
      value: stats?.leaderboardRank ?? 0,
      suffix: '',
      prefix: stats?.leaderboardRank ? '#' : '—',
      icon: Trophy,
      href: '/dashboard/leaderboard',
      accent: '#f59e0b',
      spark: [50, 40, 35, 28, 25, 24, stats?.leaderboardRank ?? 0],
      desc: 'Global standing',
    },
    {
      label: 'Applications',
      value: stats?.applications ?? 0,
      suffix: '',
      icon: Send,
      href: '/dashboard/tracker',
      accent: '#8b5cf6',
      spark: [1, 2, 3, 4, 6, 7, stats?.applications ?? 0],
      desc: 'Jobs tracked',
    },
  ];

  return (
    <div className={`space-y-8 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-2">{greeting}</p>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
            {user?.firstName ?? 'Welcome'}<span className="text-[#10a37f]">.</span>
          </h1>
          <p className="text-slate-500 mt-3 font-medium flex items-center gap-2">
            {trend && (
              <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full border"
                style={{ color: trendColor, borderColor: `${trendColor}33`, backgroundColor: `${trendColor}10` }}>
                <TrendIcon className="w-3.5 h-3.5" />
                {trend === 'improving' ? 'On the rise' : trend === 'declining' ? 'Needs focus' : 'Steady progress'}
              </span>
            )}
            {/* ✅ dateStr — new Date() নেই */}
            {dateStr && (
              <span className="text-slate-400 text-sm">{dateStr}</span>
            )}
          </p>
        </div>

        <Link href="/dashboard/mock-interviews"
          className="group flex items-center gap-2 px-5 py-3 bg-[#10a37f] text-white rounded-2xl font-bold text-sm hover:bg-[#0e9270] transition-all shadow-lg shadow-[#10a37f]/20 active:scale-95">
          <Play className="w-4 h-4" />
          Start Interview
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}
              className="group relative bg-white rounded-[1.75rem] border border-slate-100 p-6 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}>

              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ backgroundColor: card.accent }} />

              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.accent}15` }}>
                  <Icon className="w-5 h-5" style={{ color: card.accent }} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mb-1">
                <p className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                  {!stats ? '—' : (
                    <>
                      {card.prefix ?? ''}
                      {card.value > 0 || card.label === 'ATS Score'
                        ? <Counter value={card.value} suffix={card.suffix} />
                        : '—'}
                    </>
                  )}
                </p>
              </div>

              <p className="text-xs font-bold text-slate-400 mb-4">{card.desc}</p>

              <div className="flex items-end justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">{card.label}</span>
                <Sparkline data={card.spark} color={card.accent} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── Main Content ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-5">

        <div className="col-span-2 bg-white rounded-[1.75rem] border border-slate-100 p-8 min-h-[260px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Performance Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Interview scores over time</p>
            </div>
            <span className="text-xs font-bold text-slate-300 bg-slate-50 px-3 py-1.5 rounded-xl">Last 30 days</span>
          </div>

          <div className="flex-1 flex items-end gap-2 pb-2">
            {[30, 55, 45, 70, 60, 85, 75, 90, 80, 95, 85, stats?.resumeScore ?? 70].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg transition-all duration-700 hover:opacity-80"
                style={{
                  height: `${h}%`,
                  backgroundColor: i === 11 ? '#10a37f' : `#10a37f${Math.round((i / 11) * 80 + 20).toString(16)}`,
                  animationDelay: `${i * 50}ms`,
                }} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Now'].map(m => (
              <span key={m} className="text-[9px] font-bold text-slate-300 flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <Link href="/dashboard/coach"
  className="group flex-1 relative bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-[1.75rem] p-6 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all">
  <div className="relative z-10">
    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
      <Sparkles className="w-5 h-5 text-emerald-500" />
    </div>
    <h4 className="text-slate-800 font-black text-lg leading-tight mb-1">AI Career<br />Coach</h4>
    <p className="text-slate-500 text-xs">Get personalized advice</p>
  </div>
  <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-4 group-hover:gap-2 transition-all">
    Chat now <ArrowUpRight className="w-3.5 h-3.5" />
  </div>
  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-100 blur-xl group-hover:bg-emerald-200 transition-all" />
</Link>

          <Link href="/dashboard/jobs"
            className="group flex-1 relative bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-[1.75rem] p-6 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="text-slate-900 font-black text-lg leading-tight mb-1">Find Jobs</h4>
              <p className="text-slate-400 text-xs">AI-matched to your resume</p>
            </div>
            <div className="flex items-center gap-1 text-blue-500 text-xs font-bold mt-4 group-hover:gap-2 transition-all">
              Search now <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Quick Actions Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Upload Resume',  href: '/dashboard/resumes',         color: '#10a37f', icon: Target },
          { label: 'Mock Interview', href: '/dashboard/mock-interviews', color: '#3b82f6', icon: Mic2 },
          { label: 'Job Tracker',    href: '/dashboard/tracker',         color: '#8b5cf6', icon: Send },
          { label: 'Leaderboard',    href: '/dashboard/leaderboard',     color: '#f59e0b', icon: Trophy },
        ].map(action => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}
              className="group flex items-center gap-3 px-5 py-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${action.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: action.color }} />
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{action.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}