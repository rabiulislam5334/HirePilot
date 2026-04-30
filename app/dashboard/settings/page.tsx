'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Bell, Shield, Palette, Globe, Trash2, LogOut,
  Save, Loader2, Moon, Sun, Monitor, Check, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

type NotificationSettings = {
  emailInterviewReminders: boolean;
  emailLeaderboardUpdates: boolean;
  emailWeeklyReport: boolean;
  browserNotifications: boolean;
};

type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
};

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<'notifications' | 'appearance' | 'account'>('notifications');
  const [isSaving, setIsSaving]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailInterviewReminders: true,
    emailLeaderboardUpdates: true,
    emailWeeklyReport:       true,
    browserNotifications:    false,
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme:    'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  async function handleSave() {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Settings saved!');
    setIsSaving(false);
  }

  function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <button onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <div>
        <h1 className="text-4xl font-bold mb-1">Settings</h1>
        <p className="text-slate-500">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        {[
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'appearance',    label: 'Appearance',    icon: Palette },
          { id: 'account',       label: 'Account',       icon: Shield },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6">

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-5">
            <h3 className="font-black text-slate-900">Notification Preferences</h3>
            {[
              { key: 'emailInterviewReminders', label: 'Interview Reminders', desc: 'Get reminded before scheduled mock interviews' },
              { key: 'emailLeaderboardUpdates', label: 'Leaderboard Updates',  desc: 'Know when your rank changes' },
              { key: 'emailWeeklyReport',       label: 'Weekly Progress Report', desc: 'Summary of your weekly activity' },
              { key: 'browserNotifications',    label: 'Browser Notifications', desc: 'Real-time alerts in your browser' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  checked={notifications[item.key as keyof NotificationSettings]}
                  onChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
        )}

        {/* Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-slate-900 mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light',  label: 'Light',  icon: Sun },
                  { id: 'dark',   label: 'Dark',   icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map(theme => (
                  <button key={theme.id} onClick={() => setAppSettings(p => ({ ...p, theme: theme.id as AppSettings['theme'] }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      appSettings.theme === theme.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <theme.icon className="w-6 h-6 text-slate-600" />
                    <span className="text-sm font-bold text-slate-700">{theme.label}</span>
                    {appSettings.theme === theme.id && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black text-slate-900 mb-3">Language</h3>
              <select value={appSettings.language} onChange={e => setAppSettings(p => ({ ...p, language: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div>
              <h3 className="font-black text-slate-900 mb-3">Timezone</h3>
              <input value={appSettings.timezone} readOnly
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 text-slate-500" />
              <p className="text-xs text-slate-400 mt-1">Auto-detected from your browser</p>
            </div>
          </div>
        )}

        {/* Account */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <img src={user?.imageUrl ?? ''} alt="" className="w-14 h-14 rounded-2xl object-cover" />
              <div>
                <p className="font-black text-slate-900">{user?.fullName}</p>
                <p className="text-sm text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
                <p className="text-xs text-emerald-600 font-bold mt-1">Free Plan</p>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <LogOut className="w-5 h-5 text-slate-400" />
                Sign Out
              </button>

              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-red-200 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              ) : (
                <div className="border border-red-200 rounded-2xl p-4 bg-red-50 space-y-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="font-bold text-sm">Are you sure? This cannot be undone.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-all">
                      Cancel
                    </button>
                    <button className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all">
                      Delete Forever
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab !== 'account' && (
        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50">
          {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
      )}
    </div>
  );
}