'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Loader2, User, Sparkles, BookOpen, Mic2, Target, TrendingUp } from 'lucide-react';
import { sendCoachMessage, fetchChatHistory, clearChatHistory } from '@/app/actions/coach-actions';
import { toast } from 'sonner';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
};

const QUICK_PROMPTS = [
  { icon: BookOpen, text: 'Review my resume and give tips', label: 'Resume Tips' },
  { icon: Mic2,     text: 'How do I answer "Tell me about yourself"?', label: 'Common Questions' },
  { icon: Target,   text: 'How to negotiate a higher salary?', label: 'Salary Negotiation' },
  { icon: TrendingUp, text: 'What skills should I learn for 2025?', label: 'Career Growth' },
];

export default function AICoachPage() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadHistory() {
    setIsLoadingHistory(true);
    const history = await fetchChatHistory();
    setMessages(history as Message[]);
    setIsLoadingHistory(false);
  }

  async function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message || isLoading) return;

    setInput('');
    setIsLoading(true);

    // Optimistic UI
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const result = await sendCoachMessage(message);

    if (result.success) {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.response,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } else {
      toast.error(result.error ?? 'Coach unavailable');
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    }

    setIsLoading(false);
    inputRef.current?.focus();
  }

  async function handleClear() {
    if (!confirm('Clear all chat history?')) return;
    await clearChatHistory();
    setMessages([]);
    toast.success('Chat cleared');
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900">AI Career Coach</h1>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online · Powered by Groq
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-500 border border-slate-200 rounded-lg transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : messages.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Your AI Career Coach</h2>
              <p className="text-slate-500 max-w-sm">
                Ask me anything about resumes, interviews, salary negotiation, or career growth.
              </p>
            </div>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt.label} onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-violet-400 hover:bg-violet-50 transition-all group">
                  <prompt.icon className="w-5 h-5 text-violet-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-700">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-slate-900'
                    : 'bg-gradient-to-br from-violet-500 to-purple-600'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-white" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-slate-200">
        {/* Quick prompts when chat has messages */}
        {messages.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt.label} onClick={() => handleSend(prompt.text)}
                className="flex-shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-violet-100 hover:text-violet-700 text-slate-600 rounded-full text-xs font-bold transition-all">
                {prompt.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything... (Enter to send)"
            rows={1}
            className="flex-1 resize-none border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent max-h-32 overflow-y-auto"
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white rounded-2xl flex items-center justify-center transition-all flex-shrink-0"
          >
            {isLoading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
