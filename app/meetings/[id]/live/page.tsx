"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pause, ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import VideoUploader from "@/components/video-uploader";

// --- INTERFACES ---
interface PageProps {
  params: Promise<{ id: string }>;
}

// Định nghĩa đúng kiểu dữ liệu trả về từ API
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
  // 1. Lấy ID từ URL
  const { id } = use(params);

  // --- STATES QUẢN LÝ DỮ LIỆU ---
  // Mặc định null để hiện nút Upload nếu chưa có video
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);
  const [activeChunkId, setActiveChunkId] = useState<string | null>(null);
  
  // State Player
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // UI States
  const currentEmotion: "Calm" | "Neutral" | "Stressed" = "Stressed";
  const showStressWarning = true;

  // --- 2. FETCH DỮ LIỆU TỪ API (QUAN TRỌNG) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Lấy Video URL
        const meetingRes = await fetch(`/api/meetings/${id}`);
        if (meetingRes.ok) {
            const meetingData = await meetingRes.json();
            if (meetingData.videoUrl) setVideoUrl(meetingData.videoUrl);
        }

        // B. Lấy Transcript thật
        // Đây là bước lấy JSON về để nạp vào biến 'transcript'
        const transRes = await fetch(`/api/meetings/${id}/transcript`);
        if (transRes.ok) {
          const transData = await transRes.json();
          setTranscript(transData); // <--- Nạp dữ liệu vào State để Render dùng
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, [id]);

  // --- 3. LOGIC KARAOKE (CORE FEATURE) ---
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Tìm câu thoại khớp với giây hiện tại
    const currentChunk = transcript.find(
      (chunk) => time >= chunk.start_time && time <= chunk.end_time
    );

    // Nếu tìm thấy và khác với câu đang active -> Update & Scroll
    if (currentChunk && currentChunk.id !== activeChunkId) {
      setActiveChunkId(currentChunk.id);
      
      // Tìm phần tử DOM và cuộn tới nó
      const element = document.getElementById(`chunk-${currentChunk.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- GIAO DIỆN ---
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      
      {/* HEADER */}
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
                <h1 className="text-base font-semibold leading-none">{mockMeeting.title}</h1>
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
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-180px)]">
            
            {/* CỘT TRÁI: VIDEO PLAYER */}
            <div className="lg:col-span-2 space-y-4 flex flex-col">
              <Card className="overflow-hidden bg-black border-slate-800 flex-1 flex flex-col relative">
                <CardContent className="p-0 h-full">
                  <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center">
                    
                    {/* LOGIC: Có URL -> Hiện Video, Không -> Hiện Upload */}
                    {videoUrl ? (
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="max-h-full w-full object-contain"
                        // 🔥 BẮT BUỘC: Sự kiện này kích hoạt logic Karaoke
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                          <VideoUploader 
                            meetingId={id} 
                            onUploadComplete={(url) => setVideoUrl(url)} 
                        />
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center px-2">
                 <p className="text-sm text-muted-foreground">
                   Video Progress: {formatTime(currentTime)} / {formatTime(duration)}
                 </p>
              </div>
            </div>

            {/* CỘT PHẢI: TRANSCRIPT & EMOTION (ĐÂY LÀ PHẦN BẠN CẦN) */}
            <div className="lg:col-span-1 h-full flex flex-col gap-4 overflow-hidden">
              
              {/* Live Transcript Card */}
              <Card className="flex-1 flex flex-col shadow-lg border-0 overflow-hidden">
                <CardHeader className="pb-2 border-b shrink-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" /> Live Transcript
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 relative bg-white overflow-hidden">
                  <ScrollArea className="h-full w-full" ref={scrollRef}>
                    <div className="p-4 space-y-4 pb-20"> 
                      
                      {/* --- VÒNG LẶP RENDER DỮ LIỆU --- */}
                      {transcript.length === 0 ? (
                        // Trường hợp chưa có dữ liệu
                        <div className="text-center text-gray-400 mt-10 px-4">
                           <p>Chưa có dữ liệu hội thoại.</p>
                           <p className="text-xs mt-2">Vui lòng Upload Video để AI xử lý.</p>
                        </div>
                      ) : (
                        // Trường hợp có dữ liệu: Map từng dòng ra màn hình
                        transcript.map((chunk) => {
                          const isActive = activeChunkId === chunk.id;
                          return (
                            <div 
                              key={chunk.id}
                              id={`chunk-${chunk.id}`} 
                              onClick={() => jumpToTime(chunk.start_time)}
                              className={`
                                p-3 rounded-lg cursor-pointer transition-all duration-300 border text-sm
                                ${isActive 
                                  ? "bg-blue-50 border-blue-200 shadow-md scale-[1.02] border-l-4 border-l-blue-500" 
                                  : "bg-transparent border-transparent hover:bg-slate-50 text-slate-600"
                                }
                              `}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                                  {chunk.speaker_label || "Speaker"}
                                </span>
                                <span className="text-xs font-mono text-slate-400">
                                  {formatTime(chunk.start_time)}
                                </span>
                              </div>
                              <p className={`leading-relaxed ${isActive ? 'text-slate-900 font-medium' : ''}`}>
                                {chunk.text}
                              </p>
                            </div>
                          )
                        })
                      )}
                      {/* --- KẾT THÚC VÒNG LẶP --- */}

                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Emotion Monitor (Mock Data) */}
              <div className="shrink-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3 pt-4">
                        <CardTitle className="text-sm font-medium">Emotion Monitor</CardTitle>
                        <CardDescription className="text-xs">Current sentiment analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Current Status:</span>
                            <Badge variant="secondary" className={
                                currentEmotion === "Stressed" ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"
                            }>
                                {currentEmotion}
                            </Badge>
                        </div>
                        <div className="relative h-24 rounded-lg border bg-muted/50 p-2">
                             <div className="flex h-full items-end justify-between gap-1">
                                {mockEmotionData.map((point, index) => (
                                    <div key={index} className="flex-1 flex flex-col justify-end">
                                        <div className={`w-full rounded-t ${point.level > 0.6 ? "bg-orange-500" : point.level > 0.4 ? "bg-blue-500" : "bg-green-500"}`} style={{ height: `${point.level * 100}%` }} />
                                    </div>
                                ))}
                             </div>
                        </div>
                    </CardContent>
                  </Card>

                  {showStressWarning && (
                    <Alert variant="destructive" className="border-orange-500/50 bg-orange-500/10 py-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-600 text-xs ml-2">
                            <strong>Warning:</strong> Elevated stress levels detected.
                        </AlertDescription>
                    </Alert>
                  )}
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="sticky bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Simulation Progress:</span> {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={() => videoRef.current?.pause()}>
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