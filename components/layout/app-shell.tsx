"use client";

import { useState } from "react";
import PublicNavbar from "./PublicNavbar";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // ১. সাইডবার স্টেট এখানে ম্যানেজ করতে হবে যাতে মেইন কন্টেন্ট ডাইনামিকলি মুভ করে
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* ২. সাইডবারে স্টেট পাস করে দেওয়া হয়েছে */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* ৩. ডাইনামিক মার্জিন: সাইডবার কোলাপস হলে কন্টেন্ট বড় হয়ে যাবে */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:ml-24" : "lg:ml-72"
        )}
      >
        <PublicNavbar />

        <main className="p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}