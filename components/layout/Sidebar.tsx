"use client";

import {
  Home, FileText, Briefcase, Mic, Trophy, 
  Bot, CreditCard, ClipboardList, Menu, X 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils"; // shadcn এর cn ইউটিলিটি থাকলে

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Resumes", href: "/dashboard/resumes", icon: FileText },
  { name: "Find Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Mock Interviews", href: "/dashboard/interviews", icon: Mic },
  { name: "Applications", href: "/dashboard/applications", icon: ClipboardList },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "AI Coach", href: "/dashboard/coach", icon: Bot },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] bg-card p-2.5 rounded-xl border border-border shadow-sm active:scale-95 transition-transform"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* Overlay with Blur */}
      {open && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-dvh w-72 bg-card border-r border-border p-6 flex flex-col",
          "transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">HirePilot</h1>
          </Link>
          
          {/* Close button for mobile only */}
          <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group",
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  active ? "text-white" : "text-muted-foreground group-hover:text-primary"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Quick Info / Footer (Optional) */}
        <div className="mt-auto pt-6 border-t border-border">
          <div className="bg-muted/50 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Plan</p>
            <p className="text-sm font-bold text-foreground">Free Tier</p>
            <button className="text-xs text-primary font-medium hover:underline mt-1">Upgrade to Pro</button>
          </div>
        </div>
      </aside>
    </>
  );
}