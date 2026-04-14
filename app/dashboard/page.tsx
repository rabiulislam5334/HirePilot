import { Target, Mic2, Trophy, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const stats = [
    { 
      label: "Resume Score", 
      value: "85%", 
      icon: Target, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      label: "Interviews Done", 
      value: "12", 
      icon: Mic2, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Leaderboard Rank", 
      value: "#24", 
      icon: Trophy, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
    { 
      label: "Applications", 
      value: "8", 
      icon: Send, 
      color: "text-violet-600", 
      bg: "bg-violet-50" 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Welcome to <span className="text-emerald-500">HirePilot</span> 
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Track your progress and ace your next interview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div 
            key={item.label} 
            className="group p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className={cn("absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500", item.bg)} />
            
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("p-3 rounded-2xl transition-colors", item.bg)}>
                <item.icon className={cn("w-6 h-6", item.color)} />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {item.label}
              </h3>
            </div>
            
            <div className="flex items-baseline gap-1">
              <p className={cn("text-4xl font-black tracking-tighter", item.color)}>
                {item.value}
              </p>
              <span className="text-[10px] font-bold text-slate-400">vs last month</span>
            </div>

            {/* Subtle Progress Bar Decoration */}
            <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", item.color.replace('text', 'bg'))} 
                style={{ width: item.label === "Resume Score" ? "85%" : "60%" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Future Content Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 aspect-video bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center p-8 text-center group">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-slate-300" />
           </div>
           <h4 className="text-lg font-bold text-slate-900">Activity Analytics</h4>
           <p className="text-slate-400 text-sm max-w-xs">Visual charts for your daily interview practice and application success.</p>
        </div>
        
        <div className="aspect-video bg-emerald-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
           <div className="relative z-10">
             <h4 className="text-2xl font-black mb-2 leading-tight">Ready for a Mock Interview?</h4>
             <p className="text-emerald-100 text-sm mb-6">Our AI coach is ready to test your skills.</p>
             <button className="px-6 py-3 bg-white text-emerald-600 rounded-2xl font-bold text-sm hover:shadow-lg transition-all active:scale-95">
               Start Session
             </button>
           </div>
           <Mic2 className="absolute -right-8 -bottom-8 w-40 h-40 text-emerald-400/20 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
}