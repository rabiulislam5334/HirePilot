'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  ChevronDown, Sparkles, Mic2, BarChart3, ArrowRight,
  FileText, Trophy, Bot, Briefcase, MessageSquare,
  Bell, CreditCard, User, Settings, BookOpen, Target,
  Zap, Star
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// ─── Mega Menu Config ────────────────────────────────────────────────────────

const MEGA_MENU = [
  {
    id: 'features',
    label: 'Features',
    columns: [
      {
        heading: 'Resume Intelligence',
        color: 'text-emerald-600',
        icon: Sparkles,
        items: [
          { label: 'AI Resume Optimizer', desc: 'ATS-friendly scoring & keyword gaps', href: '/dashboard/resumes', icon: FileText, badge: null },
          { label: 'Cover Letter AI',     desc: 'Personalized letters in seconds',     href: '/dashboard/cover-letter', icon: BookOpen, badge: 'New' },
        ],
      },
      {
        heading: 'Interview Mastery',
        color: 'text-violet-600',
        icon: Mic2,
        items: [
          { label: 'Mock Interviews',   desc: 'Adaptive AI with real-time feedback', href: '/dashboard/mock-interviews', icon: Mic2,   badge: null },
          { label: 'AI Career Coach',   desc: 'Personalized career guidance 24/7',   href: '/dashboard/coach',          icon: Bot,    badge: null },
        ],
      },
      {
        heading: 'Growth Tools',
        color: 'text-amber-600',
        icon: BarChart3,
        items: [
          { label: 'Job Search',        desc: 'Real listings with AI match scores',  href: '/dashboard/jobs',        icon: Briefcase,     badge: null },
          { label: 'Job Tracker',       desc: 'Kanban board for applications',        href: '/dashboard/tracker',     icon: Target,        badge: null },
          { label: 'Leaderboard',       desc: 'Compete with peers globally',          href: '/dashboard/leaderboard', icon: Trophy,        badge: null },
          { label: 'Community Chat',    desc: 'Connect with other job seekers',       href: '/dashboard/chat',        icon: MessageSquare, badge: null },
        ],
      },
    ],
  },
];

const NAV_LINKS = [
  { label: 'Pricing',   href: '/dashboard/billing' },
  { label: 'Dashboard', href: '/dashboard' },
];

// ─── Keyboard & click-outside close ─────────────────────────────────────────

function useMegaMenu() {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return { open, setOpen, ref };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PublicNavbar() {
  const { isSignedIn } = useUser();
  const router   = useRouter();
  const pathname = usePathname();
  const { open, setOpen, ref } = useMegaMenu();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between" ref={ref}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-all overflow-hidden">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <text x="16" y="23" fontFamily="Arial Black, sans-serif" fontSize="20" fontWeight="900" textAnchor="middle" fill="white">H</text>
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tighter text-slate-900">HirePilot</span>
            <p className="text-[10px] -mt-1 tracking-widest text-emerald-600 font-bold">AI CAREER OS</p>
          </div>
        </Link>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-8">

          {/* Mega Menu Triggers */}
          {MEGA_MENU.map(menu => (
            <div key={menu.id} className="relative">
              <button
                onClick={() => setOpen(open === menu.id ? null : menu.id)}
                onMouseEnter={() => setOpen(menu.id)}
                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-8 cursor-pointer ${
                  open === menu.id ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'
                }`}>
                {menu.label}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open === menu.id ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {/* Mega Dropdown */}
              {open === menu.id && (
                <div
                  onMouseLeave={() => setOpen(null)}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[860px] pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white border border-slate-200 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 grid gap-8"
                    style={{ gridTemplateColumns: `repeat(${menu.columns.length}, 1fr)` }}>

                    {menu.columns.map(col => {
                      const ColIcon = col.icon;
                      return (
                        <div key={col.heading} className="space-y-3">
                          {/* Column heading */}
                          <div className={`flex items-center gap-2 font-black text-[11px] uppercase tracking-wider px-3 ${col.color}`}>
                            <ColIcon className="w-3.5 h-3.5" />
                            {col.heading}
                          </div>

                          {/* Items */}
                          <div className="space-y-1">
                            {col.items.map(item => {
                              const ItemIcon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setOpen(null)}
                                  className="group/item flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all">
                                  <div className="w-8 h-8 bg-slate-100 group-hover/item:bg-white rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-none group-hover/item:shadow-sm">
                                    <ItemIcon className="w-4 h-4 text-slate-500 group-hover/item:text-emerald-600 transition-colors" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-sm group-hover/item:text-emerald-600 transition-colors">
                                        {item.label}
                                      </span>
                                      {item.badge && (
                                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">
                                          {item.badge}
                                        </span>
                                      )}
                                      <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover/item:opacity-100 -translate-x-1 group-hover/item:translate-x-0 transition-all ml-auto flex-shrink-0" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Regular links */}
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className={`text-sm font-semibold transition-colors ${
                pathname === link.href ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <button onClick={() => router.push('/dashboard/notifications')}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                <Bell className="w-5 h-5" />
              </button>
              <button onClick={() => router.push('/dashboard')}
                className="text-sm font-bold text-slate-700 hover:text-emerald-600 px-4 transition-colors cursor-pointer">
                Dashboard
              </button>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <button className="text-sm font-bold text-slate-700 hover:text-emerald-600 px-4 transition-colors cursor-pointer">
                  Log in
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95">
                  Get Started Free
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}