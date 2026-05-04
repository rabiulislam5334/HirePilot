'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Sparkles, Copy, Download, RefreshCw,
  Loader2, Check, ChevronDown, Building2, User, Target
} from 'lucide-react';
import { generateCoverLetter } from '@/app/actions/cover-letter-actions';
import { fetchMyResumes } from '@/app/actions/resume-actions';
import { toast } from 'sonner';

type Resume = { id: string; name: string; atsScore: number | null };

const TONES = ['Professional', 'Enthusiastic', 'Confident', 'Creative', 'Concise'];

const TEMPLATES = [
  { id: 'standard',   label: 'Standard',    desc: 'Classic professional format' },
  { id: 'story',      label: 'Story-based',  desc: 'Opens with a compelling story' },
  { id: 'achievement',label: 'Achievement',  desc: 'Leads with key accomplishments' },
];

export default function CoverLetterPage() {
  const [resumes, setResumes]       = useState<Resume[]>([]);
  const [resumeId, setResumeId]     = useState('');
  const [jobTitle, setJobTitle]     = useState('');
  const [company, setCompany]       = useState('');
  const [jobDesc, setJobDesc]       = useState('');
  const [tone, setTone]             = useState('Professional');
  const [template, setTemplate]     = useState('standard');
  const [output, setOutput]         = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [wordCount, setWordCount]   = useState(0);

  useEffect(() => {
    fetchMyResumes().then(data => {
      setResumes(data as Resume[]);
      if (data.length > 0) setResumeId(data[0].id);
    });
  }, []);

  useEffect(() => {
    setWordCount(output.split(/\s+/).filter(Boolean).length);
  }, [output]);

  async function handleGenerate() {
    if (!jobTitle || !company) {
      toast.error('Please enter job title and company');
      return;
    }
    if (!resumeId) {
      toast.error('Please select a resume');
      return;
    }

    setIsGenerating(true);
    setOutput('');

    const result = await generateCoverLetter({
      resumeId, jobTitle, company, jobDesc, tone, template,
    });

    if (result.success) {
      setOutput(result.letter);
      toast.success('Cover letter generated!');
    } else {
      toast.error(result.error ?? 'Generation failed');
    }
    setIsGenerating(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([output], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-1">Cover Letter AI</h1>
        <p className="text-slate-500">Generate a personalized cover letter in seconds</p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* ── Left: Form ── */}
        <div className="space-y-5">

          {/* Resume */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Your Resume
            </label>
            <select value={resumeId} onChange={e => setResumeId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
              {resumes.length === 0
                ? <option>Upload a resume first</option>
                : resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
              }
            </select>
          </div>

          {/* Job Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1 block flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> Job Details
            </label>
            <input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
              placeholder="Job Title *"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            <input value={company} onChange={e => setCompany(e.target.value)}
              placeholder="Company Name *"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste job description (optional but recommended for better results)"
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
          </div>

          {/* Tone */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 block">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    tone === t
                      ? 'bg-emerald-400 text-white border-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Template */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Template Style
            </label>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                    template === t.id
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}>
                  <div>
                    <p className="font-bold text-sm">{t.label}</p>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                  </div>
                  {template === t.id && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all disabled:opacity-50">
            {isGenerating
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
              : <><Sparkles className="w-5 h-5" /> Generate Cover Letter</>}
          </button>
        </div>

        {/* ── Right: Output ── */}
        <div className="flex flex-col">
          <div className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col overflow-hidden">

            {/* Output Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-600">Cover Letter</span>
                {output && (
                  <span className="text-xs text-slate-400">{wordCount} words</span>
                )}
              </div>
              {output && (
                <div className="flex items-center gap-2">
                  <button onClick={handleGenerate} disabled={isGenerating}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Regenerate">
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-all">
                    {copied ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                  <button onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              )}
            </div>

            {/* Output Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-slate-500 font-medium">AI is crafting your letter...</p>
                  <div className="flex gap-2">
                    {['Analyzing resume', 'Matching job', 'Writing letter'].map((s, i) => (
                      <span key={s} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-400 animate-pulse"
                        style={{ animationDelay: `${i * 0.4}s` }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : output ? (
                <div className="prose prose-sm max-w-none">
                  <textarea
                    value={output}
                    onChange={e => setOutput(e.target.value)}
                    className="w-full h-full min-h-[500px] text-sm leading-relaxed text-slate-700 focus:outline-none resize-none font-sans"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-medium">Your cover letter will appear here</p>
                  <p className="text-sm text-slate-300">Fill in the details and click Generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
