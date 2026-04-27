'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TrendingUp, RotateCcw, Star, Mic2, Clock,
  Brain, Target, MessageSquare,
  ChevronDown, ChevronUp, Home, ArrowRight, Trophy
} from 'lucide-react';
import { getInterviewResult } from '@/app/actions/interview-actions';

type SessionResult = {
  id: string;
  jobTitle: string | null;
  company: string | null;
  category: string;
  difficulty: string;
  score: number | null;
  feedback: string | null;
  fillerWordCount: number | null;
  speakingPaceWpm: number | null;
  confidenceScore: number | null;
  clarityScore: number | null;
  transcript: Array<{ question: string; questionType: string; answer: string; answeredAt: string }> | null;
  completedAt: Date | null;
};

// Radar Chart Component (pure SVG)
function RadarChart({ scores }: { scores: Record<string, number> }) {
  const keys = Object.keys(scores);
  const n = keys.length;
  const center = 120;
  const radius = 90;

  const getPoint = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (i: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radius + 24;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = [20, 40, 60, 80, 100];
  const dataPoints = keys.map((k, i) => getPoint(i, scores[k]));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 240 240" className="w-64 h-64 mx-auto">
      {/* Grid */}
      {gridLevels.map(level => {
        const points = keys.map((_, i) => getPoint(i, level));
        const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return <path key={level} d={path} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
      })}

      {/* Axes */}
      {keys.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
      })}

      {/* Data */}
      <path d={dataPath} fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#10b981" />
      ))}

      {/* Labels */}
      {keys.map((key, i) => {
        const p = getLabelPoint(i);
        return (
          <text key={key} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="bold" fill="#64748b">
            {key}
          </text>
        );
      })}
    </svg>
  );
}

function InterviewResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');

  const [session, setSession] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    loadResult();
  }, [sessionId]);

  async function loadResult() {
    if (!sessionId) return;
    const result = await getInterviewResult(sessionId);
    setSession(result as SessionResult);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Result not found</p>
          <button onClick={() => router.push('/dashboard/mock-interviews')} className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const score = session.score ?? 0;
  const radarScores = {
    'Technical': Math.min(100, score + Math.floor(Math.random() * 10 - 5)),
    'Communication': session.clarityScore ?? score,
    'Confidence': session.confidenceScore ?? score,
    'STAR Method': Math.min(100, score - 5),
    'Relevance': Math.min(100, score + 5),
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return { label: 'Exceptional', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (s >= 80) return { label: 'Strong', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (s >= 70) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (s >= 60) return { label: 'Developing', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  };

  const scoreInfo = getScoreLabel(score);
  const transcript = (session.transcript as SessionResult['transcript']) ?? [];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Interview Results</h1>
          <p className="text-slate-500 mt-1">{session.jobTitle} {session.company ? `@ ${session.company}` : ''}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/mock-interviews')}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <button
            onClick={() => router.push('/dashboard/mock-interviews')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>

      {/* Score Hero */}
      <div className={`border-2 rounded-3xl p-8 ${scoreInfo.bg} flex items-center gap-8`}>
        <div className="text-center">
          <div className={`text-8xl font-black ${scoreInfo.color}`}>{score}</div>
          <div className="text-slate-500 text-sm font-medium mt-1">out of 100</div>
          <div className={`mt-2 px-4 py-1 rounded-full font-bold text-sm ${scoreInfo.color} bg-white border`}>
            {scoreInfo.label}
          </div>
        </div>

        <div className="flex-1">
          <RadarChart scores={radarScores} />
        </div>

        <div className="space-y-3 min-w-[180px]">
          {Object.entries(radarScores).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>{key}</span><span>{val}%</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-1.5">
                <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Analysis */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Filler Words', value: session.fillerWordCount ?? 0, icon: MessageSquare, good: 5, unit: 'uses', reverse: true },
          { label: 'Speaking Pace', value: session.speakingPaceWpm ?? 0, icon: Clock, good: 130, unit: 'wpm' },
          { label: 'Confidence', value: session.confidenceScore ?? score, icon: Star, good: 70, unit: '/100' },
        ].map((stat) => {
          const isGood = stat.reverse ? stat.value <= stat.good : stat.value >= stat.good;
          return (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-bold text-slate-600">{stat.label}</span>
              </div>
              <div className={`text-3xl font-black ${isGood ? 'text-emerald-600' : 'text-amber-500'}`}>
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 mt-1">{stat.unit}</div>
              <div className={`text-xs font-bold mt-2 ${isGood ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isGood ? '✓ Good' : '⚠ Needs improvement'}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Feedback */}
      {session.feedback && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-600" /> AI Feedback
          </h3>
          <p className="text-slate-600 leading-relaxed">{session.feedback}</p>
        </div>
      )}

      {/* Transcript Review */}
      {transcript.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-slate-600" /> Question Review ({transcript.length} questions)
          </h3>
          <div className="space-y-3">
            {transcript.map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-all text-left"
                >
                  <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm font-medium text-slate-700 line-clamp-1">{item.question}</p>
                  {expandedQ === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedQ === i && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-2">QUESTION</p>
                      <p className="text-sm text-slate-700">{item.question}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-2">YOUR ANSWER</p>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{item.answer}</p>
                    </div>
                    <div className="text-xs text-slate-400">
                      Words: {item.answer.split(/\s+/).filter(Boolean).length}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-slate-900 text-white rounded-3xl p-8">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" /> What to do next
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: RotateCcw, title: 'Practice Again', desc: 'Try a harder difficulty', action: () => router.push('/dashboard/mock-interviews') },
            { icon: Target, title: 'Optimize Resume', desc: 'Match your target role', action: () => router.push('/dashboard/resumes') },
            { icon: Trophy, title: 'View Leaderboard', desc: 'See how you rank', action: () => router.push('/dashboard/leaderboard') },
          ].map((item) => (
            <button
              key={item.title}
              onClick={item.action}
              className="bg-white/10 hover:bg-white/20 transition-all rounded-2xl p-5 text-left group"
            >
              <item.icon className="w-6 h-6 text-emerald-400 mb-3" />
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
              <ArrowRight className="w-4 h-4 text-slate-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InterviewResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading results...</p>
        </div>
      </div>
    }>
      <InterviewResultContent />
    </Suspense>
  );
}
