"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // সাইডবার কোলাপসড কি না তা ট্র্যাক করার জন্য স্টেট
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar - স্টেট এবং সেট-স্টেট পাস করে দেওয়া হয়েছে */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content - ডাইনামিক মার্জিন */}
      <main 
        className={cn(
          "flex-1 p-6 lg:p-10 overflow-x-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:ml-24" : "lg:ml-72"
        )}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}