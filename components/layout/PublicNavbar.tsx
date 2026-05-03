'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { ChevronDown, Sparkles, Mic2, BarChart3, Rocket, ArrowRight } from 'lucide-react';

export default function PublicNavbar() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#059669"/>
  <path d="M8 10 L8 22 M8 16 L16 16 M16 10 L16 22" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M19 10 L24 16 L19 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
          <div>
            <span className="text-2xl font-bold tracking-tighter text-slate-900">
              HirePilot
            </span>
            <p className="text-[10px] -mt-1 tracking-widest text-emerald-600 font-bold">
              AI CAREER OS
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-10">
          
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors py-8 cursor-pointer">
              Features 
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>

            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[850px] pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 grid grid-cols-3 gap-8">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[11px] uppercase tracking-wider px-2">
                    <Sparkles className="w-4 h-4" /> Resume Intelligence
                  </div>
                  <Link href="/features/resume" className="group/item block p-4 rounded-2xl hover:bg-slate-50 transition-all">
                    <h5 className="font-bold text-slate-900 flex items-center gap-2">
                      AI Optimizer <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">ATS-friendly resume optimization with smart keywords.</p>
                  </Link>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-violet-600 font-bold text-[11px] uppercase tracking-wider px-2">
                    <Mic2 className="w-4 h-4" /> Interview Mastery
                  </div>
                  <Link href="/features/interview" className="group/item block p-4 rounded-2xl hover:bg-slate-50 transition-all">
                    <h5 className="font-bold text-slate-900 flex items-center gap-2">
                      Voice Mock Interview <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Realistic voice coaching and real-time feedback.</p>
                  </Link>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-[11px] uppercase tracking-wider px-2">
                    <BarChart3 className="w-4 h-4" /> Growth Tools
                  </div>
                  <div className="grid grid-cols-1 gap-1 px-2">
                    {['Application Tracker', 'Live Leaderboard', 'AI Career Coach'].map((item) => (
                      <Link key={item} href="#" className="text-sm text-slate-600 hover:text-emerald-600 py-1.5 transition-colors font-medium">
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {[
            { label: 'Pricing', href: '/pricing' },
            { label: 'Dashboard', href: '/dashboard' },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Buttons — isLoaded check সরানো হয়েছে */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm font-bold text-slate-700 hover:text-emerald-600 px-4 transition-colors cursor-pointer"
              >
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
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer">
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