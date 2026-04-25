// 
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { uploadAndParseResume } from '@/actions/resume-actions';
import { toast } from 'sonner';

export default function ResumesPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file only");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAndParseResume(formData);

    if (result.success) {
      toast.success("Resume uploaded successfully! AI analysis starting...");
      setFile(null);
      // পরে এখানে AI optimization call করব
    } else {
      toast.error(result.error || "Upload failed");
    }

    setIsUploading(false);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">My Resumes</h1>
        <p className="text-slate-600 dark:text-slate-400">Upload your resume and let AI make it ATS-ready</p>
      </div>

      <Card 
        className={`dashboard-card border-2 border-dashed transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50/50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-20 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mb-6" />
              <p className="text-lg font-medium">Processing your resume...</p>
              <p className="text-sm text-slate-500 mt-2">Extracting text and preparing for AI analysis</p>
            </div>
          ) : (
            <>
              <Upload className="w-16 h-16 mx-auto mb-6 text-slate-400" />
              <h3 className="text-2xl font-semibold mb-3">Drop your resume here</h3>
              <p className="text-slate-500 mb-8">PDF only • Maximum 5MB</p>

              <input
                type="file"
                accept=".pdf"
                id="resume-upload"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />

              <label htmlFor="resume-upload">
                <Button size="lg" variant="default">
                  Select PDF File
                </Button>
              </label>

              {file && (
                <div className="mt-8">
                  <p className="text-sm text-emerald-600 font-medium">{file.name}</p>
                  <Button onClick={handleUpload} className="mt-4 bg-emerald-600">
                    Upload & Analyze with AI
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}