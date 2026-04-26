'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, useUser, UserButton } from '@clerk/nextjs';
import { ChevronDown, Sparkles, Mic2, BarChart3, Rocket, ArrowRight } from 'lucide-react';

export default function PublicNavbar() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-all">
            <Rocket className="text-white w-5 h-5" />
          </div>
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

          {['Pricing', 'Success Stories', 'About'].map((item) => (
            <Link key={item} href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              {item}
            </Link>
          ))}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
          {!isLoaded ? (
            <div className="w-32 h-10 bg-slate-100 rounded-xl animate-pulse" />
          ) : isSignedIn ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm font-bold text-slate-700 hover:text-emerald-600 px-4 transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              {/* ফিক্স: afterSignOutUrl সরিয়ে ফেলা হয়েছে */}
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-slate-700 hover:text-emerald-600 px-4 transition-colors cursor-pointer">
                  Log in
                </button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer">
                  Get Started Free
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}