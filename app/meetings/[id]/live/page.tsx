"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Pause, Volume2, Maximize, SkipBack, SkipForward, ArrowLeft, FileText, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import VideoUploader from "@/components/video-uploader";

// --- INTERFACES ---
interface PageProps {
  params: Promise<{ id: string }>;
}

interface TranscriptChunk {
  id: string;
  start_time: number;
  end_time: number;
  speaker_label: string;
  text: string;
}

const mockMeeting = {
  title: "Q4 Product Strategy Review",
  time: "2024-01-15 14:00",
  owner: "Sarah Chen",
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

  // --- STATES ---
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Generating script...");

  // --- PLAYER STATES ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- REFS ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- UI STATES ---
  const currentEmotion = "Stressed";
  const showStressWarning = true;

  // 1. HÀM TẢI DATA (Cơ bản)
  const fetchTranscriptOnce = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${id}/transcript?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
           setTranscript(data);
           return true; // Đã có dữ liệu
        }
      }
      return false; // Chưa có dữ liệu
    } catch (error) {
      console.error("Lỗi fetch:", error);
      return false;
    }
  }, [id]);

  // 2. FETCH LẦN ĐẦU (Khi vào trang)
  useEffect(() => {
    fetchTranscriptOnce();
  }, [fetchTranscriptOnce]);

  // 3. LOGIC POLLING (Hỏi liên tục sau khi upload)
  const startPollingTranscript = async () => {
    setIsTranscriptLoading(true);
    setTranscript([]);
    
    let attempts = 0;
    const maxAttempts = 20; // Thử tối đa 20 lần (khoảng 40 giây)
    
    const interval = setInterval(async () => {
        attempts++;
        setLoadingText(`Processing ...`);
        
        const success = await fetchTranscriptOnce();
        
        if (success) {
            // Nếu lấy được dữ liệu -> Dừng hỏi
            clearInterval(interval);
            setIsTranscriptLoading(false);
        } else if (attempts >= maxAttempts) {
            // Nếu quá số lần thử -> Dừng và báo lỗi
            clearInterval(interval);
            setIsTranscriptLoading(false);
            alert("AI xử lý quá lâu hoặc gặp lỗi. Vui lòng thử lại.");
        }
    }, 2000); // Cứ 2 giây hỏi 1 lần
  };

  // 4. XỬ LÝ KHI UPLOAD XONG
  const handleUploadComplete = async (url: string) => {
    setVideoUrl(url);       
    // Bắt đầu vòng lặp kiểm tra file JSON
    startPollingTranscript();
  };

  // 5. LOGIC HIỂN THỊ (Live Caption)
  const visibleTranscript = transcript.filter(
    (chunk) => chunk.start_time <= currentTime + 0.2
  );

  // 6. AUTO SCROLL
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [visibleTranscript.length]);

  // 7. VIDEO HANDLERS
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

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
                  <div className="relative aspect-video bg-zinc-900 group">
                    {videoUrl ? (
                      <>
                        <video
                          ref={videoRef}
                          src={videoUrl}
                          className="w-full h-full object-contain"
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          onEnded={() => setIsPlaying(false)}
                          onClick={togglePlay}
                        />
                        {/* Custom Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                          <div className="mb-3 cursor-pointer group/timeline">
                            <div className="h-1 bg-white/30 rounded-full overflow-hidden transition-all group-hover/timeline:h-2">
                              <div className="h-full bg-black-500 rounded-full relative" style={{ width: `${progressPercent}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={togglePlay}>
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20"><SkipBack className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20"><SkipForward className="h-4 w-4" /></Button>
                              <span className="text-sm text-white font-mono ml-2 tracking-wider">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20"><Maximize className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        {!isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                            <div className="w-16 h-16 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                               <Play className="h-8 w-8 text-white fill-white ml-1" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                         <div className="w-full max-w-sm px-6">
                            <VideoUploader meetingId={id} onUploadComplete={handleUploadComplete} />
                         </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TRANSCRIPT */}
            <div className="space-y-4">
              <Card className="h-[calc(100vh-350px)] flex flex-col bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3 shrink-0 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                      {videoUrl && isPlaying && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                      Live Transcript
                    </CardTitle>
                    <CardDescription className="text-slate-500">Real-time speech recognition</CardDescription>
                  </div>
                  {/* Nút Refresh thủ công phòng khi lỗi */}
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchTranscriptOnce}>
                    <RefreshCw className={`h-3 w-3 ${isTranscriptLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                
                <CardContent className="flex-1 min-h-0 relative p-0">
                  <ScrollArea className="h-full w-full">
                    <div className="p-4 space-y-3 pb-4">
                      
                      {!videoUrl && <div className="text-center text-slate-400 py-10 text-sm">Waiting for video upload...</div>}

                      {/* LOADING STATE */}
                      {videoUrl && isTranscriptLoading && (
                         <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-black-500" />
                            <p className="text-xs">{loadingText}</p>
                         </div>
                      )}

                      {/* READY STATE (Load xong nhưng chưa chạy video) */}
                      {videoUrl && !isTranscriptLoading && visibleTranscript.length === 0 && (
                         <div className="text-center text-slate-400 py-10 text-sm">
                            {transcript.length > 0 ? "Ready! Press play." : "No speech detected yet."}
                         </div>
                      )}

                      {/* CONTENT */}
                      {visibleTranscript.map((entry, index) => {
                         const isLatest = index === visibleTranscript.length - 1;
                         return (
                            <div 
                              key={entry.id} 
                              className={`
                                space-y-1 p-3 rounded-lg transition-all duration-500 animate-in fade-in slide-in-from-bottom-2
                                ${isLatest 
                                    ? "bg-black-50 border-l-4 border-black shadow-sm scale-100 opacity-100" 
                                    : "bg-transparent border-l-4 border-transparent scale-98 opacity-50 hover:opacity-100 hover:bg-slate-50"
                                }
                              `}
                            >
                              <div className="flex items-baseline gap-2 justify-between">
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-xs font-mono ${isLatest ? "text-black-600" : "text-slate-400"}`}>{formatTime(entry.start_time)}</span>
                                    <span className={`text-sm font-semibold ${isLatest ? "text-black-700" : "text-slate-500"}`}>{entry.speaker_label}</span>
                                </div>
                              </div>
                              <p className={`text-sm leading-relaxed ${isLatest ? "text-slate-900 font-medium" : "text-slate-500"}`}>{entry.text}</p>
                            </div>
                         )
                      })}
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
                          : "bg-black-500/10 text-black-600"
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