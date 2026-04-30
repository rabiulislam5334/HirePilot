'use client';

import { useState, useEffect } from 'react';
import {
  Search, MapPin, DollarSign, Briefcase, Clock,
  Sparkles, Plus, ExternalLink, Loader2,
  Filter, Building2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { addJobAndApply, analyzeJobMatch } from '@/app/actions/job-actions';
import { fetchMyResumes } from '@/app/actions/resume-actions';
import { toast } from 'sonner';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  type?: string;
  postedAt?: string;
  url?: string;
  matchScore?: number;
  isAnalyzing?: boolean;
};

type Resume = { id: string; name: string; atsScore: number | null };

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];
const POPULAR_SEARCHES = ['Frontend Developer', 'Backend Developer', 'Full Stack', 'React Developer', 'Node.js', 'Python Developer', 'DevOps Engineer', 'Product Manager'];
const PER_PAGE = 10;

export default function JobSearchPage() {
  const [query, setQuery]             = useState('');
  const [location, setLocation]       = useState('');
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumes, setResumes]         = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [addingJobId, setAddingJobId] = useState<string | null>(null);
  const [jobType, setJobType]         = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs]     = useState(0);
  const totalPages = Math.ceil(totalJobs / PER_PAGE);

  useEffect(() => {
    fetchMyResumes().then(data => {
      setResumes(data as Resume[]);
      if (data.length > 0) setSelectedResume(data[0].id);
    });
  }, []);

  async function searchJobs(page = 1) {
    if (!query.trim()) { toast.error('Please enter a job title'); return; }

    setIsLoading(true);
    setHasSearched(true);
    setSelectedJob(null);

    try {
      const params = new URLSearchParams({
        query,
        location: location || '',
        jobType:  jobType  || '',
        page:     String(page),
      });

      const res  = await fetch(`/api/jobs/search?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Search failed');

      const mapped: Job[] = (data.results ?? []).map((j: {
        id: string;
        title: string;
        company?: { display_name: string };
        location?: { display_name: string };
        description: string;
        salary_min?: number;
        salary_max?: number;
        contract_time?: string;
        created: string;
        redirect_url: string;
      }) => ({
        id:          j.id,
        title:       j.title,
        company:     j.company?.display_name  ?? 'Unknown',
        location:    j.location?.display_name ?? 'Remote',
        description: j.description,
        salary:      j.salary_min
          ? `$${Math.round(j.salary_min / 1000)}k - $${Math.round((j.salary_max ?? j.salary_min) / 1000)}k`
          : undefined,
        type:     j.contract_time ?? 'Full-time',
        postedAt: new Date(j.created).toLocaleDateString(),
        url:      j.redirect_url,
      }));

      setJobs(mapped);
      setTotalJobs(data.total ?? 0);
      setCurrentPage(page);

      if (mapped.length === 0) toast.info('No jobs found. Try different keywords.');

    } catch (err) {
      console.error('❌ Search error:', err);
      toast.error('Search failed. Check console for details.');
    }

    setIsLoading(false);
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    searchJobs(page);
  }

  async function getMatchScore(job: Job) {
    if (!selectedResume || job.matchScore !== undefined) return;
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isAnalyzing: true } : j));

    const result = await analyzeJobMatch({
      resumeId:       selectedResume,
      jobDescription: job.description,
      jobTitle:       job.title,
      company:        job.company,
    });

    setJobs(prev => prev.map(j =>
      j.id === job.id
        ? { ...j, isAnalyzing: false, matchScore: result.success ? result.data.matchScore : undefined }
        : j
    ));

    if (selectedJob?.id === job.id && result.success) {
      setSelectedJob(prev => prev ? { ...prev, matchScore: result.data.matchScore } : prev);
    }
  }

  async function handleAddToTracker(job: Job) {
    if (!selectedResume) { toast.error('Please select a resume first'); return; }
    setAddingJobId(job.id);

    const result = await addJobAndApply({
      resumeId:       selectedResume,
      jobTitle:       job.title,
      company:        job.company,
      jobDescription: job.description,
      location:       job.location,
      salaryRange:    job.salary,
      matchScore:     job.matchScore,
    });

    if (result.success) {
      toast.success(`${job.title} added to Job Tracker!`);
    } else {
      toast.error(result.error ?? 'Failed to add');
    }
    setAddingJobId(null);
  }

  const getScoreColor = (score: number) =>
    score >= 80 ? 'text-emerald-600 bg-emerald-50' :
    score >= 60 ? 'text-amber-600 bg-amber-50' :
                  'text-red-500 bg-red-50';

  // Pagination component
  function Pagination() {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 pt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">...</span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageChange(p as number)}
              disabled={isLoading}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                currentPage === p
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {p}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-1">Find Jobs</h1>
        <p className="text-slate-500">Search real job listings with AI-powered match scores</p>
      </div>

      {/* Resume selector */}
      {resumes.length > 0 && (
        <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3">
          <Sparkles className="w-4 h-4 text-violet-600 flex-shrink-0" />
          <span className="text-sm font-bold text-violet-700">Match against:</span>
          <select value={selectedResume} onChange={e => setSelectedResume(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold text-violet-900 focus:outline-none">
            {resumes.map(r => (
              <option key={r.id} value={r.id}>{r.name} {r.atsScore ? `(ATS: ${r.atsScore})` : ''}</option>
            ))}
          </select>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchJobs(1)}
              placeholder="Job title, skills, or keywords..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
            />
          </div>
          <button onClick={() => searchJobs(1)} disabled={isLoading}
            className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {JOB_TYPES.map(type => (
            <button key={type} onClick={() => setJobType(jobType === type ? '' : type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                jobType === type
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}>
              {type}
            </button>
          ))}
        </div>

        {/* Popular searches */}
        {!hasSearched && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400">Popular:</span>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => setQuery(s)}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-600 transition-all">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
            <p className="text-slate-600 font-medium">Searching jobs...</p>
          </div>
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Job List + Pagination */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-sm font-bold text-slate-500">
              {totalJobs.toLocaleString()} jobs found — Page {currentPage} of {totalPages}
            </p>

            {jobs.map(job => (
              <div key={job.id}
                onClick={() => { setSelectedJob(job); getMatchScore(job); }}
                className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedJob?.id === job.id
                    ? 'border-emerald-500 shadow-md shadow-emerald-100'
                    : 'border-slate-200'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm line-clamp-1">{job.title}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>
                  {job.isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500 flex-shrink-0" />
                  ) : job.matchScore !== undefined ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black flex-shrink-0 ${getScoreColor(job.matchScore)}`}>
                      {job.matchScore}%
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary}</span>}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <Pagination />
          </div>

          {/* Job Detail */}
          <div className="lg:col-span-3">
            {selectedJob ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedJob.title}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{selectedJob.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedJob.location}</span>
                    </div>
                  </div>
                  {selectedJob.matchScore !== undefined && (
                    <div className="text-center">
                      <div className={`text-3xl font-black ${getScoreColor(selectedJob.matchScore).split(' ')[0]}`}>
                        {selectedJob.matchScore}%
                      </div>
                      <p className="text-xs text-slate-400">match</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedJob.salary && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
                      <DollarSign className="w-3 h-3" /> {selectedJob.salary}
                    </span>
                  )}
                  {selectedJob.type && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold">
                      <Briefcase className="w-3 h-3" /> {selectedJob.type}
                    </span>
                  )}
                  {selectedJob.postedAt && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold">
                      <Clock className="w-3 h-3" /> {selectedJob.postedAt}
                    </span>
                  )}
                </div>

                {selectedJob.matchScore === undefined && !selectedJob.isAnalyzing && (
                  <button onClick={() => getMatchScore(selectedJob)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-violet-50 border border-violet-200 rounded-2xl text-sm font-bold text-violet-700 hover:bg-violet-100 transition-all">
                    <Sparkles className="w-4 h-4" /> Check AI Match Score
                  </button>
                )}
                {selectedJob.isAnalyzing && (
                  <div className="flex items-center justify-center gap-2 py-3 bg-violet-50 rounded-2xl text-sm font-bold text-violet-700">
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing match...
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Job Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-6">{selectedJob.description}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleAddToTracker(selectedJob)}
                    disabled={addingJobId === selectedJob.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50">
                    {addingJobId === selectedJob.id
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                      : <><Plus className="w-4 h-4" /> Add to Tracker</>}
                  </button>
                  {selectedJob.url && (
                    <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">
                      <ExternalLink className="w-4 h-4" /> Apply
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium">Select a job to see details</p>
              </div>
            )}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No jobs found</p>
          <p className="text-sm text-slate-400 mt-1">Try different keywords or location</p>
        </div>
      ) : null}
    </div>
  );
}