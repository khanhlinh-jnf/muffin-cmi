"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  SkipBack,
  SkipForward,
  ArrowLeft,
  FileText,
  AlertTriangle,
} from "lucide-react";
import VideoUploader from "@/components/video-uploader";

// --- INTERFACES ---
interface PageProps {
  params: Promise<{ id: string }>;
}

// Định nghĩa kiểu dữ liệu Transcript thật
interface TranscriptChunk {
  id: string;
  start_time: number;
  end_time: number;
  speaker_label: string;
  text: string;
}

// --- MOCK DATA (Giữ nguyên cho Header/Chart) ---
const mockMeeting = {
  id: "1",
  title: "Q4 Product Strategy Review",
  time: "2024-01-15 14:00",
  owner: "Sarah Chen",
  status: "live",
  duration: "45:00",
};

const mockEmotionData = [
  { time: 0, level: 0.3, label: "Calm" },
  { time: 2, level: 0.4, label: "Neutral" },
  { time: 4, level: 0.6, label: "Neutral" },
  { time: 6, level: 0.8, label: "Stressed" },
  { time: 8, level: 0.7, label: "Stressed" },
  { time: 10, level: 0.5, label: "Neutral" },
  { time: 12, level: 0.4, label: "Calm" },
];

export default function LiveSimulationPage({ params }: PageProps) {
  const { id } = use(params);

  // --- STATES DỮ LIỆU ---
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);

  // --- PLAYER STATES ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- REFS ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null); // Để auto-scroll

  // --- UI STATES ---
  const currentEmotion = "Stressed"; // Mock
  const showStressWarning = true;

  // 1. FETCH TRANSCRIPT
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const transRes = await fetch(`/api/meetings/${id}/transcript`);
        if (transRes.ok) {
          const transData = await transRes.json();
          setTranscript(transData);
        }
      } catch (error) {
        console.error("Lỗi tải transcript:", error);
      }
    };
    fetchTranscript();
  }, [id]);

  // 2. LOGIC LIVE CAPTION (Lọc các câu đã nói)
  // +0.2s để chữ hiện nhanh hơn tiếng 1 chút xíu
  const visibleTranscript = transcript.filter(
    (chunk) => chunk.start_time <= currentTime + 0.2
  );

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [visibleTranscript.length]);

  // 4. VIDEO HANDLERS
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Tính phần trăm cho thanh progress bar
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* --- HEADER (Giữ nguyên) --- */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                CMI
              </div>
              <div>
                <h1 className="text-base font-semibold leading-none">
                  {mockMeeting.title}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockMeeting.time} • {mockMeeting.owner}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Live Simulation
            </Badge>
            <Link href="/settings">
              <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-450">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Video Player (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="overflow-hidden bg-black border-slate-800">
                <CardContent className="p-0">
                  {/* Container Video */}
                  <div className="relative aspect-video bg-black group">
                    {videoUrl ? (
                      <>
                        {/* Video Element (Ẩn control gốc để dùng custom UI) */}
                        <video
                          ref={videoRef}
                          src={videoUrl}
                          className="w-full h-full object-contain"
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          onEnded={() => setIsPlaying(false)}
                          onClick={togglePlay}
                        />

                        {/* --- CUSTOM CONTROLS OVERLAY --- */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                          {/* Timeline Bar */}
                          <div className="mb-3 cursor-pointer group/timeline">
                            <div className="h-1 bg-white/20 rounded-full overflow-hidden transition-all group-hover/timeline:h-2">
                              <div
                                className="h-full bg-primary rounded-full relative"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Control Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Play/Pause Button */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20"
                                onClick={togglePlay}
                              >
                                {isPlaying ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20"
                              >
                                <SkipBack className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20"
                              >
                                <SkipForward className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20"
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>

                              <span className="text-sm text-white font-mono ml-2">
                                {formatTime(currentTime)} /{" "}
                                {formatTime(duration)}
                              </span>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-white hover:bg-white/20"
                            >
                              <Maximize className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Big Play Button Overlay (khi pause) */}
                        {!isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                              <Play className="h-8 w-8 text-white fill-white" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // Nếu chưa có Video -> Hiện Uploader
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                        <div className="w-full max-w-sm px-6">
                          <VideoUploader
                            meetingId={id}
                            onUploadComplete={setVideoUrl}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Transcript, Emotion, Alerts */}
            <div className="space-y-4">
              {/* Live Transcript */}
              <Card className="h-[calc(100vh-350px)] flex flex-col shadow-sm">
                <CardHeader className="pb-3 shrink-0 border-b bg-slate-50/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    {videoUrl && isPlaying && (
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                    Live Transcript
                  </CardTitle>
                  <CardDescription>
                    Real-time speech recognition
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0 relative center">
                  <ScrollArea className="h-full w-full">
                    <div className="p-4 space-y-4">
                      {/* Empty State */}
                      {!videoUrl && (
                        <div className="text-center text-muted-foreground py-8 text-sm">
                          Waiting for video upload...
                        </div>
                      )}

                      {/* Transcript Items */}
                      {visibleTranscript.map((entry, index) => {
                        // Check nếu là dòng mới nhất để highlight
                        const isLatest = index === visibleTranscript.length - 1;

                        return (
                          <div
                            key={entry.id}
                            className={`
                                space-y-1 p-3 rounded-lg transition-all duration-500 animate-in fade-in slide-in-from-bottom-2
                                ${
                                  isLatest
                                    ? "bg-blue-4000 border-l-4 border-black shadow-sm scale-100 opacity-100"
                                    : "bg-transparent border-l-4 border-transparent scale-98 opacity-60 hover:opacity-100"
                                }
                              `}
                          >
                            <div className="flex items-baseline gap-2 justify-between">
                              <div className="flex items-baseline gap-2">
                                <span
                                  className={`text-xs font-mono ${
                                    isLatest
                                      ? "text-black-600/70"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {formatTime(entry.start_time)}
                                </span>
                                {/* Đổi màu tên loa khi active */}
                                <span
                                  className={`text-sm font-semibold ${
                                    isLatest
                                      ? "text-black-700"
                                      : "text-foreground"
                                  }`}
                                >
                                  {entry.speaker_label}
                                </span>
                              </div>
                            </div>
                            {/* Đổi màu chữ khi active */}
                            <p
                              className={`text-sm leading-relaxed ${
                                isLatest
                                  ? "text-black-900 font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {entry.text}
                            </p>
                          </div>
                        );
                      })}

                      {/* Dummy div để scroll xuống đáy */}
                      <div ref={bottomRef} className="h-px w-full" />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Emotion Monitor (Giữ nguyên Mock Data & UI) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Emotion Monitor</CardTitle>
                  <CardDescription>Current sentiment analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Current Status:
                    </span>
                    <Badge
                      variant="secondary"
                      className={
                        currentEmotion === "Stressed"
                          ? "bg-orange-500/10 text-orange-600"
                          : currentEmotion === "Calm"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-blue-500/10 text-blue-600"
                      }
                    >
                      {currentEmotion}
                    </Badge>
                  </div>

                  <div className="relative h-32 rounded-lg border bg-muted/50 p-4">
                    <div className="flex h-full items-end justify-between gap-1">
                      {mockEmotionData.map((point, index) => (
                        <div
                          key={index}
                          className="flex-1 flex flex-col justify-end"
                        >
                          <div
                            className={`w-full rounded-t ${
                              point.level > 0.6
                                ? "bg-orange-500"
                                : point.level > 0.4
                                ? "bg-blue-500"
                                : "bg-green-500"
                            } transition-all`}
                            style={{ height: `${point.level * 100}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-x-4 bottom-2 flex justify-between text-xs text-muted-foreground">
                      <span>0m</span>
                      <span>12m</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-around text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                      <span>Calm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                      <span>Stressed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stress Warning Alert */}
              {showStressWarning && (
                <Alert
                  variant="destructive"
                  className="border-orange-500/50 bg-orange-500/10"
                >
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-600">
                    <strong>Stress Warning:</strong> Elevated stress levels
                    detected. Consider taking a break or adjusting the meeting
                    pace.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="sticky bottom-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Simulation Progress:</span>{" "}
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => videoRef.current?.pause()}
            >
              <Pause className="h-4 w-4" />
              Pause Simulation
            </Button>
            <Link href={`/meetings/${id}/summary`}>
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                End Simulation & Go to Summary
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
