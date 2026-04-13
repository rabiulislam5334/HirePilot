'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg" />
            <span className="text-xl font-black tracking-tighter text-slate-900">HirePilot</span>
          </div>
          <p className="text-slate-500 text-sm max-w-xs">
            Elevating careers through AI-driven intelligence and adaptive practice.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#" className="hover:text-emerald-600 transition-colors">Features</Link>
          <Link href="#" className="hover:text-emerald-600 transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-emerald-600 transition-colors">Success Stories</Link>
          <Link href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
        </div>

        <div className="text-slate-400 text-sm font-medium">
          © 2026 HirePilot AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}