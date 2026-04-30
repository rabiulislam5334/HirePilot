'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Star, Flame, TrendingUp, Crown, Loader2, RefreshCw, Wifi, WifiOff, Zap } from 'lucide-react';
import { fetchLeaderboard, fetchMyRank } from '@/app/actions/interview-actions';
import { useLeaderboardSocket, type LeaderboardUpdate } from '@/hooks/useSocket';
import { toast } from 'sonner';

type LeaderboardEntry = {
  userId: string;
  score: number;
  rank: number;
  name: string;
  image: string | null;
  xp: number;
  level: number;
  badges: string[];
};

function Avatar({ name, image, size = 'md' }: { name: string; image: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (image) return <img src={image} alt={name} className={`${sizeClass} rounded-2xl object-cover`} />;
  return (
    <div className={`${sizeClass} rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-black text-white`}>
      {name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  const color = level >= 10 ? 'bg-amber-100 text-amber-700' : level >= 5 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-black ${color}`}>Lv.{level}</span>;
}

function LiveBanner({ update }: { update: LeaderboardUpdate | null }) {
  if (!update) return null;
  return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-700 animate-pulse">
      <Zap className="w-4 h-4 flex-shrink-0" />
      <span>{update.name} just scored {update.score} on {update.jobTitle}!</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries]         = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank]           = useState<number | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [lastUpdate, setLastUpdate]   = useState<LeaderboardUpdate | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setIsLoading(true);
    const [board, rank] = await Promise.all([fetchLeaderboard(), fetchMyRank()]);
    setEntries(board as LeaderboardEntry[]);
    setMyRank(rank);
    setLastUpdated(new Date());
    setIsLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ─── Socket.io — real-time leaderboard updates ───────────────────────────────

  const handleUpdate = useCallback((data: LeaderboardUpdate) => {
    setLastUpdate(data);
    toast.success(`🏆 ${data.name} scored ${data.score} on ${data.jobTitle}!`, { duration: 4000 });
    load();
    setTimeout(() => setLastUpdate(null), 5000);
  }, []);

  const handleOnlineCount = useCallback((count: number) => {
    setOnlineCount(count);
  }, []);

  useLeaderboardSocket(handleUpdate, handleOnlineCount);

  // Track connection status separately
  useEffect(() => {
    // dynamic import to avoid SSR issues
    import('socket.io-client').then(({ io }) => {
      const socket = io({ path: '/api/socketio' });
      socket.on('connect',    () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      return () => { socket.disconnect(); };
    });
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-1">Leaderboard</h1>

          <p className="text-slate-500 text-sm">Updated {lastUpdated?.toLocaleTimeString() ?? "Loading..."}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            {isConnected
              ? <><Wifi className="w-3.5 h-3.5" /> {onlineCount} watching</>
              : <><WifiOff className="w-3.5 h-3.5" /> Connecting...</>
            }
          </div>

          {myRank && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-black text-amber-700">Your Rank #{myRank}</span>
            </div>
          )}

          <button onClick={load} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live update banner */}
      <LiveBanner update={lastUpdate} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No entries yet</p>
          <p className="text-sm text-slate-400 mt-1">Complete a mock interview to appear on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8">
              <div className="flex items-end justify-center gap-4">
                {/* 2nd */}
                {top3[1] && (
                  <div className="flex flex-col items-center gap-3">
                    <Avatar name={top3[1].name} image={top3[1].image} size="md" />
                    <div className="text-center">
                      <p className="font-bold text-white text-sm">{top3[1].name || 'Anonymous'}</p>
                      <p className="text-slate-400 text-xs">{top3[1].score} pts</p>
                    </div>
                    <div className="w-20 h-16 bg-slate-600 rounded-t-xl flex items-end justify-center pb-2">
                      <span className="text-2xl font-black text-slate-300">2</span>
                    </div>
                  </div>
                )}

                {/* 1st */}
                {top3[0] && (
                  <div className="flex flex-col items-center gap-3 -mb-2">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <Avatar name={top3[0].name} image={top3[0].image} size="lg" />
                    <div className="text-center">
                      <p className="font-black text-white">{top3[0].name || 'Anonymous'}</p>
                      <p className="text-amber-400 text-sm font-bold">{top3[0].score} pts</p>
                    </div>
                    <div className="w-24 h-24 bg-amber-500 rounded-t-xl flex items-end justify-center pb-2">
                      <span className="text-3xl font-black text-white">1</span>
                    </div>
                  </div>
                )}

                {/* 3rd */}
                {top3[2] && (
                  <div className="flex flex-col items-center gap-3">
                    <Avatar name={top3[2].name} image={top3[2].image} size="md" />
                    <div className="text-center">
                      <p className="font-bold text-white text-sm">{top3[2].name || 'Anonymous'}</p>
                      <p className="text-slate-400 text-xs">{top3[2].score} pts</p>
                    </div>
                    <div className="w-20 h-12 bg-orange-600 rounded-t-xl flex items-end justify-center pb-2">
                      <span className="text-2xl font-black text-white">3</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="space-y-2">
              {rest.map((entry) => (
                <div key={entry.userId}
                  className={`bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                    lastUpdate?.userId === entry.userId
                      ? 'border-emerald-400 shadow-md shadow-emerald-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <span className="w-8 text-center font-black text-slate-400 text-lg">{entry.rank}</span>
                  <Avatar name={entry.name} image={entry.image} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{entry.name || 'Anonymous'}</p>
                      <LevelBadge level={entry.level} />
                      {lastUpdate?.userId === entry.userId && (
                        <span className="text-xs text-emerald-600 font-bold animate-pulse">● just updated</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{entry.xp.toLocaleString()} XP</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">{entry.score}</p>
                    <p className="text-xs text-slate-400">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Players', value: entries.length,          icon: Star },
              { label: 'Top Score',     value: entries[0]?.score ?? 0,  icon: Flame },
              { label: 'Your Rank',     value: myRank ? `#${myRank}` : '-', icon: TrendingUp },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}