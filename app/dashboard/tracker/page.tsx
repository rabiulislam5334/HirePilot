'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Briefcase, Building2, MapPin, DollarSign,
  ChevronRight, Loader2, X, ExternalLink, BarChart3,
  Star, Clock, CheckCircle2, XCircle, Sparkles
} from 'lucide-react';
import { fetchKanbanBoard, moveApplicationStatus, addJobAndApply, analyzeJobMatch } from '@/app/actions/job-actions';
import { fetchMyResumes } from '@/app/actions/resume-actions';
import { toast } from 'sonner';

type KanbanStatus = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected';

type Application = {
  id: string;
  status: string;
  matchScore: number | null;
  notes: string | null;
  appliedAt: Date;
  interviewDate: Date | null;
  nextStep: string | null;
  job: { title: string; company: string; location: string | null; salaryRange: string | null };
  resume: { name: string; atsScore: number | null } | null;
};

type KanbanBoard = Record<KanbanStatus, Application[]>;

const COLUMNS: { id: KanbanStatus; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'wishlist',  label: 'Wishlist',   icon: Star,         color: 'text-slate-500',  bg: 'bg-slate-100' },
  { id: 'applied',   label: 'Applied',    icon: Briefcase,    color: 'text-blue-600',   bg: 'bg-blue-50' },
  { id: 'interview', label: 'Interview',  icon: Clock,        color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'offer',     label: 'Offer',      icon: CheckCircle2, color: 'text-emerald-600',bg: 'bg-emerald-50' },
  { id: 'rejected',  label: 'Rejected',   icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50' },
];

function ScoreBadge({ score }: { score: number | null }) {
  if (!score) return null;
  const color = score >= 80 ? 'bg-emerald-100 text-emerald-700' : score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-black ${color}`}>{score}%</span>;
}

type Resume = { id: string; name: string; atsScore: number | null };

export default function TrackerPage() {
  const [board, setBoard]       = useState<KanbanBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedId, setDraggedId]  = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanStatus | null>(null);

  // Add job form state
  const [jobTitle, setJobTitle]   = useState('');
  const [company, setCompany]     = useState('');
  const [location, setLocation]   = useState('');
  const [salary, setSalary]       = useState('');
  const [jobDesc, setJobDesc]     = useState('');
  const [resumeId, setResumeId]   = useState('');
  const [resumes, setResumes]     = useState<Resume[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => { loadBoard(); loadResumes(); }, []);

  async function loadBoard() {
    setIsLoading(true);
    const data = await fetchKanbanBoard();
    setBoard(data as KanbanBoard);
    setIsLoading(false);
  }

  async function loadResumes() {
    const data = await fetchMyResumes();
    setResumes(data as Resume[]);
    if (data.length > 0) setResumeId(data[0].id);
  }

  async function handleDrop(targetStatus: KanbanStatus, appId: string) {
    if (!board) return;
    const result = await moveApplicationStatus(appId, targetStatus);
    if (result.success) {
      await loadBoard();
    } else {
      toast.error('Failed to move');
    }
    setDraggedId(null);
    setDragOverCol(null);
  }

  async function handleAddJob() {
    if (!jobTitle || !company || !resumeId) {
      toast.error('Please fill in job title, company, and select a resume');
      return;
    }
    setIsSaving(true);

    let matchScore: number | undefined;

    // AI match analysis if job description provided
    if (jobDesc.trim()) {
      setIsAnalyzing(true);
      const matchResult = await analyzeJobMatch({
        resumeId,
        jobDescription: jobDesc,
        jobTitle,
        company,
      });
      setIsAnalyzing(false);
      if (matchResult.success) matchScore = matchResult.data.matchScore;
    }

    const result = await addJobAndApply({
      resumeId,
      jobTitle,
      company,
      jobDescription: jobDesc || `${jobTitle} at ${company}`,
      location: location || undefined,
      salaryRange: salary || undefined,
      matchScore,
    });

    if (result.success) {
      toast.success('Job added to tracker!');
      setShowAddModal(false);
      resetForm();
      await loadBoard();
    } else {
      toast.error(result.error ?? 'Failed to add job');
    }
    setIsSaving(false);
  }

  function resetForm() {
    setJobTitle(''); setCompany(''); setLocation('');
    setSalary(''); setJobDesc('');
    if (resumes.length > 0) setResumeId(resumes[0].id);
  }

  const totalApps = board ? Object.values(board).flat().length : 0;
  const interviews = board?.interview?.length ?? 0;
  const offers     = board?.offer?.length ?? 0;

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-1">Job Tracker</h1>
          <p className="text-slate-500">Track your applications across every stage</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all">
          <Plus className="w-5 h-5" /> Add Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: totalApps, icon: Briefcase, color: 'text-blue-600' },
          { label: 'Interviews',    value: interviews, icon: Clock,     color: 'text-violet-600' },
          { label: 'Offers',        value: offers,    icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Success Rate',  value: totalApps > 0 ? `${Math.round((offers / totalApps) * 100)}%` : '0%', icon: BarChart3, color: 'text-amber-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
            <div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const ColIcon = col.icon;
            const cards   = board?.[col.id] ?? [];
            return (
              <div key={col.id}
                onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => { e.preventDefault(); if (draggedId) handleDrop(col.id, draggedId); }}
                className={`min-h-[500px] rounded-2xl p-3 transition-all ${dragOverCol === col.id ? 'ring-2 ring-emerald-400 bg-emerald-50/30' : 'bg-slate-100/50'}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <ColIcon className={`w-4 h-4 ${col.color}`} />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wide">{col.label}</span>
                  </div>
                  <span className={`w-5 h-5 rounded-full ${col.bg} flex items-center justify-center text-xs font-black ${col.color}`}>
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {cards.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400 font-medium">
                      Drop here
                    </div>
                  ) : (
                    cards.map(app => (
                      <div key={app.id}
                        draggable
                        onDragStart={() => setDraggedId(app.id)}
                        onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                        className={`bg-white border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${draggedId === app.id ? 'opacity-40' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{app.job.title}</p>
                          <ScoreBadge score={app.matchScore} />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{app.job.company}</span>
                          </div>
                          {app.job.location && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{app.job.location}</span>
                            </div>
                          )}
                          {app.job.salaryRange && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <DollarSign className="w-3 h-3" />
                              <span>{app.job.salaryRange}</span>
                            </div>
                          )}
                        </div>

                        {app.interviewDate && (
                          <div className="mt-2 px-2 py-1 bg-violet-50 rounded-lg text-xs text-violet-700 font-bold">
                            📅 {new Date(app.interviewDate).toLocaleDateString()}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                          {/* Move buttons */}
                          <div className="flex gap-1">
                            {COLUMNS.filter(c => c.id !== col.id).slice(0, 2).map(target => (
                              <button key={target.id}
                                onClick={() => handleDrop(target.id, app.id)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-all"
                                title={`Move to ${target.label}`}
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black">Add Job</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Job Title *</label>
                  <input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                    placeholder="Frontend Developer"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Company *</label>
                  <input value={company} onChange={e => setCompany(e.target.value)}
                    placeholder="Google"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="Remote / Dhaka"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Salary Range</label>
                  <input value={salary} onChange={e => setSalary(e.target.value)}
                    placeholder="$80k - $120k"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Resume *</label>
                <select value={resumeId} onChange={e => setResumeId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.name} {r.atsScore ? `(ATS: ${r.atsScore})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Job Description <span className="text-slate-400 font-normal">(optional — for AI match score)</span>
                </label>
                <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here to get an AI-powered match score..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleAddJob}
                disabled={isSaving || !jobTitle || !company}
                className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                {isSaving ? (
                  isAnalyzing
                    ? <><Sparkles className="w-4 h-4 animate-pulse" /> Analyzing match...</>
                    : <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Add to Tracker</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}