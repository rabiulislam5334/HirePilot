"use client";

import {
  Home, FileText, Briefcase, Mic, Trophy, 
  Bot, CreditCard, ClipboardList, Menu, X, Settings,
  ChevronLeft, ChevronRight, Crown
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// TypeScript Interface: এটি Layout এর সাথে Sidebar এর যোগাযোগ ঠিক রাখবে
interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const navItems = [
  { group: "Main Menu", items: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Resumes", href: "/dashboard/resumes", icon: FileText },
    { name: "Mock Interviews", href: "/dashboard/interviews", icon: Mic },
    { name: "AI Coach", href: "/dashboard/coach", icon: Bot },
  ]},
  { group: "Career Tracking", items: [
    { name: "Find Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { name: "Applications", href: "/dashboard/applications", icon: ClipboardList },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  ]},
  { group: "Settings", items: [
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]}
];

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  
  // মোবাইল মেনুর জন্য আলাদা স্টেট
  const [mobileOpen, setMobileOpen] = useState(false);

  // পেজ চেঞ্জ হলে মোবাইল মেনু অটোমেটিক বন্ধ হবে
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* মোবাইল টগল বাটন */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-5 left-5 z-[60] bg-white p-3 rounded-2xl border border-slate-200 shadow-xl active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5 text-slate-900" />
        </button>
      )}

      {/* মোবাইল ওভারলে */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* মেইন সাইডবার কন্টেইনার */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-dvh bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none",
          isCollapsed ? "w-24" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ডেস্কটপ কোলাপস বাটন */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm z-[100] hover:bg-slate-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronLeft className="w-3 h-3 text-slate-500" />}
        </button>

        {/* লোগো সেকশন */}
        <div className={cn("flex items-center mb-10 px-6 pt-6", isCollapsed ? "justify-center" : "justify-between")}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 min-w-[40px] rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:rotate-6 transition-transform">
              <span className="text-white font-black text-xl">H</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-black tracking-tighter text-slate-900 animate-in fade-in slide-in-from-left-2 duration-500">
                HirePilot
              </h1>
            )}
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* নেভিগেশন আইটেমস */}
        <nav className="flex-1 space-y-8 overflow-y-visible px-4 custom-scrollbar">
          {navItems.map((group) => (
            <div key={group.group}>
              {!isCollapsed && (
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 mb-3 animate-in fade-in duration-500">
                  {group.group}
                </h2>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group relative",
                        active 
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 min-w-[20px]",
                        active ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"
                      )} />
                      
                      {!isCollapsed && (
                        <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                          {item.name}
                        </span>
                      )}
                      
                      {/* টুলটিপ (কোলাপসড মোডের জন্য) */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[999] shadow-xl border border-slate-800 translate-x-[-10px] group-hover:translate-x-0">
                          {item.name}
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-800" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* আপগ্রেড কার্ড */}
        <div className="mt-auto p-4 border-t border-slate-50">
          <div className={cn(
            "bg-emerald-50 rounded-[1.5rem] border border-emerald-100/50 transition-all duration-300", 
            isCollapsed ? "p-2" : "p-5"
          )}>
            {isCollapsed ? (
              <div className="flex justify-center py-2">
                <Crown className="w-5 h-5 text-emerald-600 animate-bounce" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Free Tier</p>
                </div>
                <button className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                  Upgrade
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}