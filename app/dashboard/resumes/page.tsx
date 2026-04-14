import ResumeUpload from "@/components/resume/ResumeUpload";

export default function ResumesPage() {
  return (
    <div className="space-y-10 py-5">
      <div className="text-center space-y-2">
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
          Resume <span className="text-emerald-500">Intelligence</span>
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Upload your resume and let our AI optimize it for ATS.
        </p>
      </div>
      
      {/* Upload Section */}
      <ResumeUpload />

      {/* Placeholder for Previous Resumes */}
      <div className="pt-10 border-t border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Your Recent Resumes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <p className="text-sm font-medium">No resumes found</p>
          </div>
        </div>
      </div>
    </div>
  );
}