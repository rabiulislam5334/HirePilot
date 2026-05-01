'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  User, Mail, MapPin, Code, Target,
  Plus, X, Save, Camera, Loader2,
  Globe, DollarSign
} from 'lucide-react';
import { saveUserProfile, fetchUserProfile } from '@/app/actions/profile-actions';
import { toast } from 'sonner';

type Profile = {
  name: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  targetRoles: string[];
  targetSalary: string;
  experience: string;
  website: string;
  github: string;
  linkedin: string;
  openToWork: boolean;
  preferredWorkType: string;
};

const EXPERIENCE_LEVELS = ['Student', 'Entry Level (0-1 yr)', 'Junior (1-3 yrs)', 'Mid-level (3-5 yrs)', 'Senior (5-8 yrs)', 'Lead/Principal (8+ yrs)'];
const WORK_TYPES = ['Full-time', 'Part-time', 'Remote', 'Hybrid', 'Contract', 'Freelance'];

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile>({
    name: '', title: '', location: '', bio: '',
    skills: [], targetRoles: [], targetSalary: '',
    experience: '', website: '', github: '', linkedin: '',
    openToWork: true, preferredWorkType: 'Remote',
  });
  const [newSkill, setNewSkill]   = useState('');
  const [newRole, setNewRole]     = useState('');
  const [isSaving, setIsSaving]   = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'basic' | 'career' | 'social'>('basic');

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserProfile().then(data => {
        if (data) {
          setProfile(prev => ({ ...prev, ...data }));
        } else {
          setProfile(prev => ({
            ...prev,
            name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
          }));
        }
        setIsLoading(false);
      });
    }
  }, [isLoaded, user]);

  async function handleSave() {
    setIsSaving(true);
    const result = await saveUserProfile(profile);
    if (result.success) {
      toast.success('Profile saved!');
    } else {
      toast.error('Failed to save profile');
    }
    setIsSaving(false);
  }

  function addSkill() {
    const s = newSkill.trim();
    if (!s || profile.skills.includes(s)) return;
    setProfile(prev => ({ ...prev, skills: [...prev.skills, s] }));
    setNewSkill('');
  }

  function removeSkill(skill: string) {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }

  function addRole() {
    const r = newRole.trim();
    if (!r || profile.targetRoles.includes(r)) return;
    setProfile(prev => ({ ...prev, targetRoles: [...prev.targetRoles, r] }));
    setNewRole('');
  }

  function removeRole(role: string) {
    setProfile(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(r => r !== role) }));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">My Profile</h1>
          <p className="text-slate-400 text-sm">Your career identity — used by AI for personalized recommendations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all disabled:opacity-50 border border-slate-200"
        >
          {isSaving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>

      {/* Avatar + Open to Work */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-5">
        <div className="relative">
          <img
            src={user?.imageUrl ?? ''}
            alt={profile.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
          />
          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer transition-all">
            <Camera className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-slate-800">{profile.name || user?.fullName || 'Your Name'}</h2>
            {profile.openToWork && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Open to Work
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">{profile.title || 'Add your job title'}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <Mail className="w-3 h-3" />
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Open to Work</span>
          <button
            onClick={() => setProfile(prev => ({ ...prev, openToWork: !prev.openToWork }))}
            className={`relative w-11 h-6 rounded-full transition-all ${profile.openToWork ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${profile.openToWork ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'basic',  label: 'Basic Info',  icon: User },
          { id: 'career', label: 'Career Goals', icon: Target },
          { id: 'social', label: 'Social Links', icon: Globe },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">

        {/* ── Basic Info ── */}
        {activeTab === 'basic' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Job Title</label>
                <input
                  value={profile.title}
                  onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                  placeholder="Senior Frontend Developer"
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={profile.location}
                  onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full pl-10 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Bio</label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about yourself, your passion, and what you're looking for..."
                rows={4}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Experience Level</label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setProfile(p => ({ ...p, experience: level }))}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      profile.experience === level
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}>
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" /> Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 text-slate-400 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill (e.g. React, Python)"
                  className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Career Goals ── */}
        {activeTab === 'career' && (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Target Roles</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.targetRoles.map(role => (
                  <span key={role} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
                    {role}
                    <button onClick={() => removeRole(role)} className="ml-1 text-emerald-400 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addRole()}
                  placeholder="Add target role (e.g. Senior React Developer)"
                  className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                />
                <button
                  onClick={addRole}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Target Salary</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={profile.targetSalary}
                    onChange={e => setProfile(p => ({ ...p, targetSalary: e.target.value }))}
                    placeholder="$80k - $120k"
                    className="w-full pl-10 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Preferred Work Type</label>
                <select
                  value={profile.preferredWorkType}
                  onChange={e => setProfile(p => ({ ...p, preferredWorkType: e.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                >
                  {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── Social Links ── */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            {[
              { key: 'website',  label: 'Website',  placeholder: 'https://yourwebsite.com' },
              { key: 'github',   label: 'GitHub',   placeholder: 'https://github.com/username' },
              { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={profile[field.key as keyof Profile] as string}
                    onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full pl-10 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}