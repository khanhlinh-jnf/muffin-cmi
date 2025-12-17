"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Upload,
  FileVideo,
  FileAudio,
  CheckCircle2,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";

export default function NewMeetingPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock upload progress
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Main Content */}
      <main className="mx-auto max-w-6xl p-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Meetings
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            New Meeting from Video
          </h2>
          <p className="text-muted-foreground">
            Upload a video or audio recording to generate meeting insights
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Details</CardTitle>
                  <CardDescription>
                    Enter information about your meeting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Q4 Strategy Review"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the meeting (optional)"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" type="time" />
                    </div>
                  </div>

                  {/* Tags / Project */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags / Project</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., product, engineering, Q4"
                    />
                    <p className="text-sm text-muted-foreground">
                      Separate multiple tags with commas
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Recording</CardTitle>
                  <CardDescription>
                    Drag and drop or browse for your video/audio file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-lg border-2 border-dashed transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="sr-only"
                      accept="video/*,audio/*"
                      onChange={handleFileSelect}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center gap-4 p-12 cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      {selectedFile ? (
                        <div className="text-center">
                          <p className="text-sm font-medium">{selectedFile}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click to change file
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            Drop your file here or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Supports MP4, MKV, MP3, WAV formats
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Progress Indicator */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Uploading...
                        </span>
                        <span className="font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
                <Button type="submit" size="lg" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Create & Upload
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Upload Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileVideo className="h-4 w-4 text-primary" />
                    Supported Video Formats
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-6">
                    <li>MP4 (recommended)</li>
                    <li>MKV</li>
                    <li>AVI</li>
                    <li>MOV</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileAudio className="h-4 w-4 text-primary" />
                    Supported Audio Formats
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-6">
                    <li>MP3</li>
                    <li>WAV</li>
                    <li>M4A</li>
                    <li>AAC</li>
                  </ul>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-semibold">File Size Limits</h4>
                  <p className="text-muted-foreground">
                    Maximum file size: 2 GB
                  </p>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-semibold">Processing Time</h4>
                  <p className="text-muted-foreground">
                    Typical processing time is 5-10 minutes per hour of
                    recording. You'll be notified when complete.
                  </p>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-semibold">What Happens Next?</h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Speech-to-Text extraction</li>
                    <li>AI summary generation</li>
                    <li>Automatic chapter detection</li>
                    <li>Chatbot preparation</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Toast Notification (Mock) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
          <Card className="shadow-lg border-green-500/20 bg-green-500/10">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Meeting created!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Processing in background...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
