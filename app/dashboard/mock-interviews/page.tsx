'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic2, Brain, Target, Clock, ChevronRight, Trophy,
  BarChart3, Star, Flame, TrendingUp, Play, History,
  Building2, Layers, Zap
} from 'lucide-react';
import { startInterview, fetchInterviewHistory, fetchMyRank } from '@/app/actions/interview-actions';
import { toast } from 'sonner';

type Session = {
  id: string;
  jobTitle: string | null;
  company: string | null;
  score: number | null;
  category: string;
  difficulty: string;
  completedAt: Date | null;
  fillerWordCount: number | null;
  confidenceScore: number | null;
};

const CATEGORIES = [
  { id: 'behavioral', label: 'Behavioral', icon: Brain, desc: 'STAR method, soft skills', color: 'from-violet-500 to-purple-600' },
  { id: 'technical', label: 'Technical', icon: Zap, desc: 'DSA, system design, coding', color: 'from-blue-500 to-cyan-600' },
  { id: 'mixed', label: 'Mixed', icon: Layers, desc: 'Best of both worlds', color: 'from-emerald-500 to-teal-600' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Junior', color: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { id: 'medium', label: 'Mid-level', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { id: 'hard', label: 'Senior', color: 'border-red-400 bg-red-50 text-red-700' },
];

const COMPANIES = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Uber', 'Airbnb', 'Stripe', 'Other'];

const POPULAR_ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'ML Engineer'];

export default function MockInterviewsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'setup' | 'history'>('setup');
  const [category, setCategory] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab]);

  useEffect(() => {
    fetchMyRank().then(r => setRank(r));
  }, []);

  async function loadHistory() {
    setLoadingHistory(true);
    const data = await fetchInterviewHistory();
    setHistory(data as Session[]);
    setLoadingHistory(false);
  }

  async function handleStart() {
    if (!jobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }
    setIsStarting(true);
    const result = await startInterview({
      jobTitle: jobTitle.trim(),
      company: company || undefined,
      category: category as 'behavioral' | 'technical' | 'mixed',
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
    });
    if (result.success) {
      router.push(`/dashboard/mock-interviews/session?id=${result.sessionId}`);
    } else {
      toast.error(result.error || 'Failed to start');
      setIsStarting(false);
    }
  }

  const avgScore = history.length > 0
    ? Math.round(history.reduce((s, h) => s + (h.score ?? 0), 0) / history.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getDifficultyBadge = (d: string) => {
    const map: Record<string, string> = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };
    return map[d] ?? 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-1">Mock Interviews</h1>
          <p className="text-slate-500">AI-powered interview practice with real-time feedback</p>
        </div>
        {rank && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-amber-700">Rank #{rank}</span>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sessions', value: history.length, icon: Mic2, color: 'text-violet-600' },
            { label: 'Avg Score', value: `${avgScore}%`, icon: BarChart3, color: 'text-emerald-600' },
            { label: 'Best Score', value: `${Math.max(...history.map(h => h.score ?? 0))}%`, icon: Star, color: 'text-amber-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        {[{ id: 'setup', label: 'New Interview', icon: Play }, { id: 'history', label: 'History', icon: History }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'setup' | 'history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'setup' ? (
        <div className="space-y-6">

          {/* Job Title */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" /> Target Role
            </h3>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setJobTitle(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${jobTitle === role ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Target Company <span className="text-xs font-normal text-slate-400">(optional)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {COMPANIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCompany(company === c ? '' : c)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${company === c ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" /> Interview Type
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${category === cat.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:border-slate-400'}`}
                >
                  <cat.icon className={`w-6 h-6 mb-2 ${category === cat.id ? 'text-white' : 'text-slate-600'}`} />
                  <p className="font-bold text-sm">{cat.label}</p>
                  <p className={`text-xs mt-1 ${category === cat.id ? 'text-slate-300' : 'text-slate-500'}`}>{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Difficulty Level
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${difficulty === d.id ? d.color + ' border-current' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interview Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 5-7 questions</span>
            <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> Adaptive AI</span>
            <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Detailed scoring</span>
            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Leaderboard points</span>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={isStarting || !jobTitle.trim()}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
          >
            {isStarting ? (
              <><span className="animate-spin">⚡</span> Starting Interview...</>
            ) : (
              <><Play className="w-6 h-6" /> Start Interview<ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      ) : (
        // History Tab
        <div className="space-y-4">
          {loadingHistory ? (
            <div className="text-center py-20 text-slate-400">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <Mic2 className="w-16 h-16 mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No interviews yet</p>
              <p className="text-sm text-slate-400 mt-1">Start your first mock interview!</p>
              <button onClick={() => setTab('setup')} className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">
                Start Now
              </button>
            </div>
          ) : (
            history.map((session) => (
              <div key={session.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-400 transition-all">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-7 h-7 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{session.jobTitle ?? 'Interview'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {session.company && <span className="text-xs text-slate-500">{session.company}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getDifficultyBadge(session.difficulty)}`}>{session.difficulty}</span>
                    <span className="text-xs text-slate-400">{session.completedAt ? new Date(session.completedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-black ${getScoreColor(session.score ?? 0)}`}>{session.score ?? '-'}</p>
                  <p className="text-xs text-slate-400">/ 100</p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/mock-interviews/result?id=${session.id}`)}
                  className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
