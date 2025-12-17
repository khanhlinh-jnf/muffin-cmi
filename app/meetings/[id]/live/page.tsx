import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Pause, Volume2, Maximize, SkipBack, SkipForward, ArrowLeft, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"

// Mock meeting data
const mockMeeting = {
  id: "1",
  title: "Q4 Product Strategy Review",
  time: "2024-01-15 14:00",
  owner: "Sarah Chen",
  status: "live",
  duration: "45:00",
  currentTime: "12:34",
}

// Mock transcript data
const mockTranscript = [
  { timestamp: "00:15", speaker: "Sarah Chen", text: "Welcome everyone to our Q4 Product Strategy Review." },
  {
    timestamp: "00:23",
    speaker: "Sarah Chen",
    text: "Today we'll be discussing our roadmap priorities and key initiatives for the quarter.",
  },
  {
    timestamp: "01:45",
    speaker: "Mike Johnson",
    text: "Thanks Sarah. I'd like to start by reviewing our current sprint progress.",
  },
  {
    timestamp: "02:10",
    speaker: "Mike Johnson",
    text: "We've completed 85% of our planned features and are on track for the release.",
  },
  {
    timestamp: "03:30",
    speaker: "Emily Rodriguez",
    text: "I have some concerns about the timeline for the mobile app updates.",
  },
  { timestamp: "04:15", speaker: "Sarah Chen", text: "Let's dive into that. What specific blockers are you seeing?" },
  {
    timestamp: "05:20",
    speaker: "Emily Rodriguez",
    text: "The main issue is around the authentication flow redesign.",
  },
  {
    timestamp: "06:45",
    speaker: "David Kim",
    text: "From a marketing perspective, we need to align the launch with our campaign schedule.",
  },
  { timestamp: "08:10", speaker: "Sarah Chen", text: "Good point. Let's make sure we coordinate those timelines." },
  {
    timestamp: "09:30",
    speaker: "Lisa Wang",
    text: "I can help bridge the design and engineering teams to speed this up.",
  },
]

// Mock emotion data points for the chart
const mockEmotionData = [
  { time: 0, level: 0.3, label: "Calm" },
  { time: 2, level: 0.4, label: "Neutral" },
  { time: 4, level: 0.6, label: "Neutral" },
  { time: 6, level: 0.8, label: "Stressed" },
  { time: 8, level: 0.7, label: "Stressed" },
  { time: 10, level: 0.5, label: "Neutral" },
  { time: 12, level: 0.4, label: "Calm" },
]

export default function LiveSimulationPage({ params }: { params: { id: string } }) {
  const currentEmotion: "Calm" | "Neutral" | "Stressed" = "Stressed"
  const showStressWarning = true

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Bar */}
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
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-450">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Video Player (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Video Player Mock */}
                  <div className="relative aspect-video bg-black">
                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
                      <div className="text-center text-white">
                        <Play className="mx-auto h-16 w-16 mb-4 opacity-50" />
                        <p className="text-sm text-slate-400">Video Player</p>
                      </div>
                    </div>

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
                      {/* Timeline */}
                      <div className="mb-3">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full w-[28%] bg-primary rounded-full" />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                            <SkipBack className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                            <SkipForward className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-white font-mono">
                            {mockMeeting.currentTime} / {mockMeeting.duration}
                          </span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Transcript, Emotion, Alerts */}
            <div className="space-y-4">
              {/* Live Transcript */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Live Transcript</CardTitle>
                  <CardDescription>Real-time speech recognition</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-75 pr-4">
                    <div className="space-y-4">
                      {mockTranscript.map((entry, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-mono text-muted-foreground">{entry.timestamp}</span>
                            <span className="text-sm font-semibold">{entry.speaker}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Emotion Monitor */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Emotion Monitor</CardTitle>
                  <CardDescription>Current sentiment analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Status:</span>
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

                  {/* Emotion Chart Placeholder */}
                  <div className="relative h-32 rounded-lg border bg-muted/50 p-4">
                    <div className="flex h-full items-end justify-between gap-1">
                      {mockEmotionData.map((point, index) => (
                        <div key={index} className="flex-1 flex flex-col justify-end">
                          <div
                            className={`w-full rounded-t ${
                              point.level > 0.6 ? "bg-orange-500" : point.level > 0.4 ? "bg-blue-500" : "bg-green-500"
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

                  {/* Legend */}
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
                <Alert variant="destructive" className="border-orange-500/50 bg-orange-500/10">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-600">
                    <strong>Stress Warning:</strong> Elevated stress levels detected. Consider taking a break or
                    adjusting the meeting pace.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="sticky bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Simulation Progress:</span> 12:34 / 45:00
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Pause className="h-4 w-4" />
              Pause Simulation
            </Button>
            <Link href={`/meetings/${params.id}/summary`}>
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                End Simulation & Go to Summary
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
