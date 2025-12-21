// components/video-uploader.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface VideoUploaderProps {
  onUploadComplete: (url: string) => void;
}

export default function VideoUploader({ onUploadComplete, meetingId }: VideoUploaderProps & { meetingId: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("meetingId", meetingId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUploadComplete(data.url); // Trả URL về cho trang cha
    } catch (error) {
      alert("Lỗi upload video!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-lg border border-slate-700 p-10 text-center">
      <div className="mb-4 p-4 bg-slate-800 rounded-full">
        <Upload className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Upload Meeting Video</h3>
      <p className="text-sm text-slate-400 mb-6">Support MP4, WebM (Max 50MB)</p>
      
      <div className="relative">
        <Button disabled={uploading} variant="secondary">
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {uploading ? "Uploading..." : "Select Video File"}
        </Button>
        <input
          type="file"
          accept="video/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
}