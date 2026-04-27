'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, FileText, CheckCircle2, X, Sparkles, Trash2, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { uploadAndParseResume, analyzeResumeWithAI, fetchMyResumes, deleteMyResume } from '@/app/actions/resume-actions';
import { toast } from 'sonner';

type Resume = {
  id: string;
  name: string;
  originalFileName: string | null;
  atsScore: number | null;
  skills: string[];
  feedback: string | null;
  createdAt: Date;
};

type ResumeAnalysis = {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  keywordSuggestions: string[];
  improvedBullets: { original: string; improved: string; reason: string }[];
  missingSkills: string[];
  overallFeedback: string;
  extractedSkills: string[];
};

export default function ResumesPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, ResumeAnalysis>>({});

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    setLoadingResumes(true);
    const data = await fetchMyResumes();
    setResumes(data as Resume[]);
    setLoadingResumes(false);
  }

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadAndParseResume(formData);
    if (result.success) {
      toast.success('Resume uploaded successfully!');
      setFile(null);
      await loadResumes();
    } else {
      toast.error(result.error || 'Upload failed');
    }
    setIsUploading(false);
  };

  const handleAnalyze = async (resumeId: string) => {
    setAnalyzingId(resumeId);
    const result = await analyzeResumeWithAI(resumeId);
if (result.success && 'data' in result && result.data) {
  setAnalysisResults(prev => ({ ...prev, [resumeId]: result.data as ResumeAnalysis }));
      setExpandedId(resumeId);
      await loadResumes();
      toast.success('AI analysis complete!');
    } else {
      toast.error('Analysis failed');
    }
    setAnalyzingId(null);
  };

  const handleDelete = async (resumeId: string) => {
    const result = await deleteMyResume(resumeId);
    if (result.success) {
      toast.success('Resume deleted');
      setResumes(prev => prev.filter(r => r.id !== resumeId));
    } else {
      toast.error('Delete failed');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">My Resumes</h1>
        <p className="text-slate-600">Upload your resume and let AI make it ATS-ready</p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
        className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all bg-white ${isDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-14 h-14 animate-spin text-emerald-600 mb-4" />
            <p className="text-lg font-medium">Processing your resume...</p>
          </div>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${file ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
              {file ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </div>
            {file ? (
              <div className="space-y-3">
                <p className="text-xl font-bold">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline flex items-center gap-1 mx-auto">
                  <X className="w-3 h-3" /> Remove
                </button>
                <button onClick={handleUpload} className="mt-2 flex items-center gap-2 mx-auto px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">
                  <FileText className="w-5 h-5" /> Upload Resume
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-1">Drop your resume here</h3>
                <p className="text-slate-500 mb-6 text-sm">PDF only • Maximum 5MB</p>
                <input type="file" accept=".pdf" id="resume-upload" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                <label htmlFor="resume-upload" className="cursor-pointer px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all">
                  Select PDF File
                </label>
              </>
            )}
          </>
        )}
      </div>

      {/* Resume List */}
      {loadingResumes ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : resumes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Uploaded Resumes</h2>
          {resumes.map((resume) => {
            const analysis = analysisResults[resume.id];
            const score = analysis?.atsScore ?? resume.atsScore ?? 0;
            const isExpanded = expandedId === resume.id;
            const isAnalyzed = score > 0;

            return (
              <div key={resume.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-slate-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{resume.name}</p>
                    <p className="text-sm text-slate-500">{new Date(resume.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* ATS Score */}
                  {isAnalyzed && (
                    <div className="text-center px-4">
                      <p className={`text-3xl font-black ${getScoreColor(score)}`}>{score}</p>
                      <p className="text-xs text-slate-500 font-medium">ATS Score</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isAnalyzed ? (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : resume.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                      >
                        <BarChart3 className="w-4 h-4" />
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAnalyze(resume.id)}
                        disabled={analyzingId === resume.id}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        {analyzingId === resume.id ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Analyze with AI</>
                        )}
                      </button>
                    )}
                    <button onClick={() => handleDelete(resume.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score Bar */}
                {isAnalyzed && (
                  <div className="px-5 pb-3">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${getScoreBg(score)}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                )}

                {/* Expanded Analysis */}
                {isExpanded && analysis && (
                  <div className="border-t border-slate-100 p-5 space-y-5 bg-slate-50">

                    {/* Overall Feedback */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">Overall Feedback</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{analysis.overallFeedback}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 mb-3">✅ Strengths</h4>
                        <ul className="space-y-1">
                          {analysis.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-emerald-700">• {s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <h4 className="font-bold text-red-800 mb-3">⚠️ Weaknesses</h4>
                        <ul className="space-y-1">
                          {analysis.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-red-700">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Improved Bullets */}
                    {analysis.improvedBullets.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <h4 className="font-bold text-slate-900 mb-3">✨ Improved Bullet Points</h4>
                        <div className="space-y-3">
                          {analysis.improvedBullets.slice(0, 4).map((b, i) => (
                            <div key={i} className="text-sm">
                              <p className="text-slate-400 line-through">{b.original}</p>
                              <p className="text-emerald-700 font-medium mt-1">→ {b.improved}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-3">🔑 Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordSuggestions.map((k, i) => (
                          <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">{k}</span>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-3">💼 Detected Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.extractedSkills.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{s}</span>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}