'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell, Trophy, Mic2, FileText, Briefcase, Sparkles,
  Check, CheckCheck, Trash2, Loader2, Filter, X
} from 'lucide-react';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/app/actions/notification-actions';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';

type Notification = {
  id: string;
  type: 'interview' | 'resume' | 'leaderboard' | 'job' | 'coach' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  link?: string;
};

const TYPE_CONFIG = {
  interview:   { icon: Mic2,      color: 'bg-blue-100 text-blue-600',    label: 'Interview' },
  resume:      { icon: FileText,  color: 'bg-emerald-100 text-emerald-600', label: 'Resume' },
  leaderboard: { icon: Trophy,    color: 'bg-amber-100 text-amber-600',   label: 'Leaderboard' },
  job:         { icon: Briefcase, color: 'bg-violet-100 text-violet-600', label: 'Job' },
  coach:       { icon: Sparkles,  color: 'bg-pink-100 text-pink-600',     label: 'Coach' },
  system:      { icon: Bell,      color: 'bg-slate-100 text-slate-600',   label: 'System' },
};

const FILTERS = ['All', 'Unread', 'Interview', 'Resume', 'Leaderboard', 'Job'];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [filter, setFilter]               = useState('All');
  const [deletingId, setDeletingId]       = useState<string | null>(null);

  const { on, emit } = useSocket();

  // Load notifications
  async function load() {
    setIsLoading(true);
    const data = await fetchNotifications();
    setNotifications(data as Notification[]);
    setIsLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Real-time — socket এ নতুন notification আসলে
  const handleNewNotification = useCallback((data: Notification) => {
    setNotifications(prev => [data, ...prev]);
    toast(`🔔 ${data.title}`, { description: data.message });
  }, []);

  useEffect(() => {
    emit('join_notifications');
    const cleanup = on<Notification>('new_notification', handleNewNotification);
    return () => { emit('leave_notifications'); cleanup(); };
  }, [emit, on, handleNewNotification]);

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setDeletingId(null);
  }

  const filtered = notifications.filter(n => {
    if (filter === 'All')    return true;
    if (filter === 'Unread') return !n.isRead;
    return n.type === filter.toLowerCase();
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  function timeAgo(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24)  return `${hrs}h ago`;
    return `${days}d ago`;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-black">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-all">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
          <Bell className="w-14 h-14 mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold">No notifications</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter === 'Unread' ? "You're all caught up!" : "Nothing here yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const config = TYPE_CONFIG[notif.type];
            const Icon   = config.icon;
            return (
              <div key={notif.id}
                className={`bg-white border rounded-2xl p-4 flex items-start gap-4 transition-all group ${
                  notif.isRead ? 'border-slate-200' : 'border-slate-300 shadow-sm'
                }`}>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0" onClick={() => !notif.isRead && handleMarkRead(notif.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{config.label}</span>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!notif.isRead && (
                    <button onClick={() => handleMarkRead(notif.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-all" title="Mark as read">
                      <Check className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif.id)}
                    disabled={deletingId === notif.id}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                    {deletingId === notif.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      : <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
