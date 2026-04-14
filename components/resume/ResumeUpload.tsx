"use client";

import { useState } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToAI = async () => {
    if (!file) return;
    setIsUploading(true);
    // এখানে আমাদের Server Action কল হবে
    setTimeout(() => setIsUploading(false), 2000); // Temporary loading simulation
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className={cn(
        "relative group border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-300 flex flex-col items-center justify-center text-center",
        file ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 hover:border-emerald-400 bg-white"
      )}>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept=".pdf"
          onChange={handleFileChange}
        />
        
        <div className={cn(
          "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
          file ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"
        )}>
          {file ? <CheckCircle2 className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
        </div>

        {file ? (
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">{file.name}</h3>
            <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
            <button 
              onClick={() => setFile(null)}
              className="mt-4 text-xs font-bold text-red-500 hover:underline flex items-center gap-1 mx-auto"
            >
              <X className="w-3 h-3" /> Remove File
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">Upload your Resume</h3>
            <p className="text-sm text-slate-400 font-medium">Drag and drop your PDF here, or click to browse</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold mt-4">Supported format: PDF only</p>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={uploadToAI}
          disabled={isUploading}
          className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {isUploading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing with AI...</>
          ) : (
            <><FileText className="w-6 h-6" /> Scan & Optimize Resume</>
          )}
        </button>
      )}
    </div>
  );
}