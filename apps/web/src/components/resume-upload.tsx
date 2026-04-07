"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@ai-mock-interview/ui/components/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = useCallback((selectedFile: File | null) => {
    setError(null);
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileChange(droppedFile);
    },
    [handleFileChange],
  );

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobRole", "Software Developer");

      const response = await fetch("/api/interview/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Questions generated — starting interview");
      router.push(`/interview/${data.interviewId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold tracking-wide">New Interview</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload your resume as PDF · Software Developer role · 3 questions
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          group relative flex flex-col items-center justify-center gap-3
          rounded-lg border-2 border-dashed p-10 cursor-pointer
          transition-all duration-300
          ${
            isDragging
              ? "border-primary/60 bg-primary/5 scale-[1.01]"
              : file
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
          }
        `}
      >
        <div
          className={`
            rounded-full p-3 transition-all duration-300
            ${file ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"}
          `}
        >
          {file ? <FileText className="size-5" /> : <Upload className="size-5" />}
        </div>

        {file ? (
          <div className="text-center">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(file.size / 1024).toFixed(0)} KB · Click to change
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium">Drop your resume here</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PDF only · 10MB max
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
      </div>

      {error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!file || isUploading}
        className="mt-4 w-full"
      >
        {isUploading ? (
          <>
            <Loader2 data-icon="inline-start" className="animate-spin" />
            Generating Questions...
          </>
        ) : (
          "Start Interview"
        )}
      </Button>
    </div>
  );
}
