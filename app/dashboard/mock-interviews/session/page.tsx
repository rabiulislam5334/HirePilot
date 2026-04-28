'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Send, Mic, MicOff, ChevronRight, AlertCircle,
  Lightbulb, X, CheckCircle2, Brain, Zap, BarChart3, Loader2
} from 'lucide-react';
import { fetchNextQuestion, submitAnswer, finishInterview } from '@/app/actions/interview-actions';
import { useInterviewSessionSocket, type SessionEvaluated } from '@/hooks/useSocket';
import { toast } from 'sonner';

type Question = { question: string; type: string; hint: string };

const QUESTION_TIME = 180;
const MAX_QUESTIONS = 7;

const TYPE_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  behavioral:  { color: 'bg-violet-100 text-violet-700', icon: Brain,     label: 'Behavioral' },
  technical:   { color: 'bg-blue-100 text-blue-700',    icon: Zap,       label: 'Technical' },
  situational: { color: 'bg-amber-100 text-amber-700',  icon: BarChart3, label: 'Situational' },
};

const STAR_TIPS = [
  '⭐ Situation — Set the context briefly',
  '🎯 Task — What was your responsibility?',
  '⚡ Action — What did YOU specifically do?',
  '✅ Result — Quantify the outcome if possible',
];

function InterviewSessionContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get('id');

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer]         = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [timeLeft, setTimeLeft]     = useState(QUESTION_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing]   = useState(false);
  const [showHint, setShowHint]     = useState(false);
  const [showSTAR, setShowSTAR]     = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [wordCount, setWordCount]   = useState(0);
  const [phase, setPhase]           = useState<'loading' | 'answering' | 'evaluating'>('loading');

  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  // ─── Socket — wait for BullMQ evaluation result ─────────────────────────────

  const handleEvaluated = useCallback((data: SessionEvaluated) => {
    console.log("[socket] session_evaluated:", data);
    toast.success(`Score: ${data.score}/100 — Redirecting to results...`);
    router.push(`/dashboard/mock-interviews/result?id=${data.sessionId}`);
  }, [router]);

  useInterviewSessionSocket(sessionId, handleEvaluated);

  // ─── Timer ───────────────────────────────────────────────────────────────────

  function startTimer() {
    setTimeLeft(QUESTION_TIME);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const loadFirstQuestion = useCallback(async () => {
    if (!sessionId) return;
    setPhase('loading');
    const result = await fetchNextQuestion({ sessionId });
    if (result.success && result.question) {
      setCurrentQuestion(result.question as Question);
      setQuestionNumber(1);
      setPhase('answering');
      startTimer();
    } else {
      toast.error('Failed to load question');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    loadFirstQuestion();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loadFirstQuestion]);

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
    setWordCount(e.target.value.split(/\s+/).filter(Boolean).length);
  };

  // ─── Finish — queues BullMQ job, socket will redirect when done ──────────────

  async function handleFinish() {
    if (!sessionId) return;
    setIsFinishing(true);
    setPhase('evaluating');

    const result = await finishInterview(sessionId);
    if (result.success) {
      toast.loading('AI is evaluating your answers... (this may take 30–60 seconds)', {
        id: 'eval', duration: 90000,
      });
      // Socket will fire "session_evaluated" when BullMQ worker finishes
    } else {
      toast.error(result.error ?? 'Evaluation failed');
      setIsFinishing(false);
      setPhase('answering');
    }
  }

  async function handleSubmitAnswer() {
    if (!sessionId || !currentQuestion || !answer.trim()) {
      toast.error('Please write your answer first');
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    await submitAnswer({
      sessionId,
      question:     currentQuestion.question,
      questionType: currentQuestion.type,
      answer:       answer.trim(),
    });

    if (questionNumber >= MAX_QUESTIONS) {
      handleFinish();
      return;
    }

    setPhase('loading');
    const result = await fetchNextQuestion({ sessionId, lastAnswer: answer.trim() });

    if (result.success && result.question) {
      setCurrentQuestion(result.question as Question);
      setQuestionNumber(prev => prev + 1);
      setAnswer(''); setWordCount(0);
      setShowHint(false); setShowSTAR(false);
      setPhase('answering');
      startTimer();
    } else {
      toast.error('Failed to load next question');
    }
    setIsSubmitting(false);
  }

  // ─── Voice ───────────────────────────────────────────────────────────────────

  function toggleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechAPI = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechAPI) { toast.error('Voice not supported in this browser'); return; }

    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechAPI() as any;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as ArrayLike<{ [key: number]: { transcript: string } }>)
        .map(r => r[0].transcript).join('');
      setAnswer(transcript);
      setWordCount(transcript.split(/\s+/).filter(Boolean).length);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }

  const timerPercent = (timeLeft / QUESTION_TIME) * 100;
  const timerColor   = timeLeft > 60 ? 'stroke-emerald-500' : timeLeft > 30 ? 'stroke-amber-500' : 'stroke-red-500';
  const typeConfig   = currentQuestion ? (TYPE_CONFIG[currentQuestion.type] ?? TYPE_CONFIG.behavioral) : TYPE_CONFIG.behavioral;
  const TypeIcon     = typeConfig.icon;

  // ─── Evaluating screen ───────────────────────────────────────────────────────

  if (phase === 'evaluating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">AI is evaluating your answers</h2>
            <p className="text-slate-500">Our AI is analyzing your responses, communication style, and STAR method usage.</p>
            <p className="text-sm text-slate-400 mt-2">This usually takes 30–60 seconds...</p>
          </div>
          <div className="flex justify-center gap-2">
            {['Technical depth', 'Communication', 'Confidence', 'STAR method'].map((label, i) => (
              <div key={label} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'loading' && questionNumber === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Preparing your interview...</p>
          <p className="text-sm text-slate-400">AI is generating personalized questions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-500">Question {questionNumber} of {MAX_QUESTIONS}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all ${
                  i < questionNumber - 1 ? 'bg-emerald-500 w-2' :
                  i === questionNumber - 1 ? 'bg-slate-900 w-4' : 'bg-slate-200 w-2'
                }`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" className={timerColor}
                    strokeWidth="3" strokeDasharray={`${timerPercent} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black">
                  {timeLeft <= 60 ? formatTime(timeLeft) : `${Math.ceil(timeLeft / 60)}m`}
                </span>
              </div>
              <span className={`text-sm font-bold ${timeLeft <= 30 ? 'text-red-500' : 'text-slate-600'}`}>
                {timeLeft <= 30 ? 'Hurry up!' : formatTime(timeLeft)}
              </span>
            </div>
            <button onClick={() => { if (confirm('End interview early?')) handleFinish(); }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-500 border border-slate-200 rounded-lg transition-all">
              <X className="w-3 h-3" /> End Early
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {phase === 'loading' ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-slate-600 font-medium">Generating next question...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${typeConfig.color}`}>
                  <TypeIcon className="w-3.5 h-3.5" /> {typeConfig.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${questionNumber === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {questionNumber === 1 ? 'Opening' : 'Follow-up'}
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 leading-relaxed">{currentQuestion?.question}</p>
              <div className="flex gap-2">
                <button onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700">
                  <Lightbulb className="w-3.5 h-3.5" /> {showHint ? 'Hide hint' : 'Show hint'}
                </button>
                {currentQuestion?.type === 'behavioral' && (
                  <button onClick={() => setShowSTAR(!showSTAR)}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700">
                    <Brain className="w-3.5 h-3.5" /> STAR method
                  </button>
                )}
              </div>
              {showHint && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">💡 {currentQuestion?.hint}</div>}
              {showSTAR && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-1">
                  {STAR_TIPS.map((tip, i) => <p key={i} className="text-sm text-violet-800">{tip}</p>)}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">Your Answer</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${wordCount < 50 ? 'text-slate-400' : wordCount < 150 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {wordCount} words {wordCount < 50 ? '(too short)' : wordCount < 150 ? '(good)' : '(excellent)'}
                  </span>
                  <button onClick={toggleVoice}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {isListening ? <><MicOff className="w-3.5 h-3.5" /> Stop</> : <><Mic className="w-3.5 h-3.5" /> Voice</>}
                  </button>
                </div>
              </div>
              <textarea ref={textareaRef} value={answer} onChange={handleAnswerChange}
                placeholder="Type your answer here... Be specific, use examples, and quantify results where possible."
                className="w-full p-6 text-sm leading-relaxed text-slate-800 placeholder:text-slate-300 focus:outline-none resize-none min-h-[200px]"
                rows={8} />
              <div className="px-6 pb-2">
                <div className="w-full bg-slate-100 rounded-full h-1">
                  <div className={`h-1 rounded-full transition-all ${wordCount >= 150 ? 'bg-emerald-500' : wordCount >= 50 ? 'bg-amber-500' : 'bg-slate-300'}`}
                    style={{ width: `${Math.min((wordCount / 200) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">Aim for 150–200 words for a complete answer</p>
              </div>
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5" /> Answer saved when you submit
                </div>
                <div className="flex gap-3">
                  {questionNumber < MAX_QUESTIONS ? (
                    <button onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !answer.trim() || wordCount < 10}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-40">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><Send className="w-4 h-4" /> Next Question <ChevronRight className="w-4 h-4" /></>}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await submitAnswer({ sessionId: sessionId!, question: currentQuestion!.question, questionType: currentQuestion!.type, answer: answer.trim() });
                        handleFinish();
                      }}
                      disabled={isFinishing || !answer.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-40">
                      {isFinishing ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><CheckCircle2 className="w-4 h-4" /> Finish & Get Score</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {['Be specific with examples', 'Quantify your results', 'Stay concise & structured'].map(tip => (
                <div key={tip} className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-500 font-medium">{tip}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    }>
      <InterviewSessionContent />
    </Suspense>
  );
}