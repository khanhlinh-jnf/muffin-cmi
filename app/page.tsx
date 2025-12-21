"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  PlayCircle,
  FileText,
  MessageSquare,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock data for meetings
const mockMeetings = [
  {
    id: 1,
    title: "Q4 Product Strategy Review",
    time: "2024-01-15 14:00",
    owner: "Sarah Chen",
    status: "ready",
    duration: "45 min",
  },
  {
    id: 2,
    title: "Engineering Sprint Planning",
    time: "2024-01-15 10:30",
    owner: "Mike Johnson",
    status: "processing",
    duration: "60 min",
  },
  {
    id: 3,
    title: "Client Onboarding Call",
    time: "2024-01-14 16:00",
    owner: "Emily Rodriguez",
    status: "ready",
    duration: "30 min",
  },
  {
    id: 4,
    title: "Marketing Campaign Sync",
    time: "2024-01-14 11:00",
    owner: "David Kim",
    status: "failed",
    duration: "25 min",
  },
  {
    id: 5,
    title: "Design System Review",
    time: "2024-01-13 15:30",
    owner: "Lisa Wang",
    status: "ready",
    duration: "50 min",
  },
];

export default function HomePage() {
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(
    null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [detectedName, setDetectedName] = useState<string>("");
  const [checkInTime, setCheckInTime] = useState<string>("");
  const router = useRouter();

  const handleSimulationClick = (meetingId: number) => {
    setSelectedMeetingId(meetingId);
    setCheckInDialogOpen(true);
    setIsScanning(false);
    setIsCheckedIn(false);
    setDetectedName("");
    setCheckInTime("");
  };

  const handleScanFace = () => {
    setIsScanning(true);
    // Simulate face scanning with delay
    setTimeout(() => {
      setIsScanning(false);
      setIsCheckedIn(true);
      setDetectedName("Nguyen Van A (demo)");
      setCheckInTime(new Date().toLocaleTimeString("en-GB"));
    }, 2000);
  };

  const handleProceedToSimulation = () => {
    if (selectedMeetingId) {
      router.push(`/meetings/${selectedMeetingId}/live`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Meetings</h2>
              <p className="text-muted-foreground">
                View and manage all your meeting recordings and insights
              </p>
            </div>
            <Link href="/meetings/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                New Meeting from Video
              </Button>
            </Link>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Today
              </Button>
              <Button variant="outline" size="sm">
                This Week
              </Button>
              <Button variant="outline" size="sm">
                All
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            <Select defaultValue="all">
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search meetings..." className="pl-9" />
            </div>
          </div>

          {/* Meetings Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMeetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">
                      {meeting.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {meeting.time}
                    </TableCell>
                    <TableCell>{meeting.owner}</TableCell>
                    <TableCell>
                      {meeting.status === "processing" ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="gap-1">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                                Processing...
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1 text-sm">
                                <p className="font-semibold">
                                  Processing Pipeline:
                                </p>
                                <ol className="list-decimal list-inside space-y-0.5">
                                  <li>Speech-to-Text (STT)</li>
                                  <li>Summary Generation</li>
                                  <li>Chapter Detection</li>
                                </ol>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : meeting.status === "ready" ? (
                        <Badge
                          variant="default"
                          className="bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        >
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {meeting.duration}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={meeting.status !== "ready"}
                          className="gap-1.5"
                          onClick={() => handleSimulationClick(meeting.id)}
                        >
                          <PlayCircle className="h-4 w-4" />
                          Simulation
                        </Button>
                        <Link href={`/meetings/${meeting.id}/summary`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={meeting.status !== "ready"}
                            className="gap-1.5"
                          >
                            <FileText className="h-4 w-4" />
                            Summary
                          </Button>
                        </Link>
                        <Link href={`/meetings/${meeting.id}/chat`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={meeting.status !== "ready"}
                            className="gap-1.5"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Chatbot
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Face Check-in Required</DialogTitle>
            <DialogDescription>
              Please scan your face to verify your identity before joining the
              simulation session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera Preview / Face Frame */}
            <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50">
              <div className="flex h-full items-center justify-center">
                {isScanning ? (
                  <div className="space-y-3 text-center">
                    <div className="mx-auto h-32 w-32 animate-pulse rounded-full border-4 border-primary bg-primary/10" />
                    <p className="text-sm font-medium">Scanning face...</p>
                  </div>
                ) : isCheckedIn ? (
                  <div className="space-y-3 text-center">
                    <CheckCircle2 className="mx-auto h-32 w-32 text-green-500" />
                    <p className="text-sm font-medium text-green-600">
                      Face recognized successfully!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-center">
                    <Camera className="mx-auto h-32 w-32 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Position your face in the frame
                    </p>
                  </div>
                )}
              </div>

              {/* Corner Frame Indicators (only show when not checked in) */}
              {!isCheckedIn && (
                <>
                  <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-primary" />
                  <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-primary" />
                  <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-primary" />
                  <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-primary" />
                </>
              )}
            </div>

            {/* Check-in Information */}
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Detected name:
                </span>
                <span className="font-medium">{detectedName || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Check-in time:
                </span>
                <span className="font-medium">{checkInTime || "—"}</span>
              </div>
              {isCheckedIn && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant="default"
                    className="bg-green-500/10 text-green-600"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Checked in
                  </Badge>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isCheckedIn ? (
                <Button
                  onClick={handleScanFace}
                  disabled={isScanning}
                  className="flex-1 gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {isScanning ? "Scanning..." : "Scan Face & Check In"}
                </Button>
              ) : (
                <Button
                  onClick={handleProceedToSimulation}
                  className="flex-1 gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Proceed to Simulation
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setCheckInDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
