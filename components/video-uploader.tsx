"use client";
import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoUploader({ meetingId, onUploadComplete }: { meetingId: string, onUploadComplete: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("meetingId", meetingId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onUploadComplete(data.url);
      } else { alert("Upload lỗi: " + data.error); }
    } catch (err) { alert("Lỗi hệ thống"); } 
    finally { setIsUploading(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full rounded-lg p-10 text-center">
      <div className="mb-4 p-4 bg-slate-800 rounded-full">
        <Upload className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Upload Meeting Video</h3>
      <p className="text-sm text-slate-400 mb-6">Support MP4, WebM (Max 50MB)</p>
      
      <div className="relative">
        <Button disabled={isUploading} variant="secondary">
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isUploading ? "Uploading..." : "Select Video File"}
        </Button>
        <input
          type="file"
          accept="video/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}