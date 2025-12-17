import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Play,
  Volume2,
  Maximize,
  ChevronRight,
  Send,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Pencil,
  Check,
} from "lucide-react"
import Link from "next/link"

// Mock data
const mockMeeting = {
  title: "Q4 Product Strategy Review",
  time: "January 15, 2024 at 2:00 PM",
  owner: "Sarah Chen",
  duration: "45 min",
  participants: [
    { name: "Sarah Chen", avatar: "/abstract-geometric-shapes.png", initials: "SC" },
    { name: "Mike Johnson", avatar: "", initials: "MJ" },
    { name: "Emily Rodriguez", avatar: "", initials: "ER" },
    { name: "David Kim", avatar: "", initials: "DK" },
    { name: "Lisa Wang", avatar: "", initials: "LW" },
  ],
}

const mockChapters = [
  { number: 1, title: "Introduction and Agenda", duration: "3:24", timestamp: "0:00" },
  { number: 2, title: "Q3 Performance Review", duration: "8:15", timestamp: "3:24" },
  { number: 3, title: "Market Analysis & Competitive Landscape", duration: "12:30", timestamp: "11:39" },
  { number: 4, title: "Q4 Strategic Initiatives", duration: "15:45", timestamp: "24:09" },
  { number: 5, title: "Budget Allocation Discussion", duration: "7:20", timestamp: "39:54" },
  { number: 6, title: "Action Items and Next Steps", duration: "3:06", timestamp: "47:14" },
]

const mockSummaryPoints = [
  "Q3 exceeded revenue targets by 23%, driven by strong enterprise adoption in healthcare and finance sectors.",
  "Main competitor launched similar features, requiring accelerated roadmap for AI-powered insights to maintain differentiation.",
  "Q4 strategic focus: expand to mid-market segment, enhance mobile experience, and develop API partnerships.",
  "Approved 15% budget increase for product development, with majority allocated to AI/ML capabilities and scalability improvements.",
  "Engineering team to prioritize API infrastructure and mobile SDK development for Q4 releases.",
  "Marketing to launch new positioning campaign targeting mid-market decision makers in October.",
  "Next quarterly review scheduled for April 2024 with interim check-ins every 3 weeks.",
]

const mockActionItems = [
  {
    id: 1,
    task: "Finalize Q4 product roadmap document",
    assignee: "Sarah Chen",
    dueDate: "Jan 22, 2024",
    status: "in-progress",
  },
  {
    id: 2,
    task: "Prepare competitive analysis report",
    assignee: "Mike Johnson",
    dueDate: "Jan 25, 2024",
    status: "pending",
  },
  {
    id: 3,
    task: "Draft mid-market positioning strategy",
    assignee: "Emily Rodriguez",
    dueDate: "Jan 29, 2024",
    status: "pending",
  },
  {
    id: 4,
    task: "Review and approve increased budget allocation",
    assignee: "David Kim",
    dueDate: "Jan 20, 2024",
    status: "completed",
  },
  {
    id: 5,
    task: "Schedule engineering capacity planning session",
    assignee: "Lisa Wang",
    dueDate: "Jan 18, 2024",
    status: "in-progress",
  },
]

const mockDecisions = [
  {
    title: "Q4 Budget Approval",
    description: "Approved 15% increase in product development budget, totaling $2.3M for Q4.",
    impact: "High",
  },
  {
    title: "Mid-Market Expansion",
    description: "Decided to prioritize mid-market segment expansion over enterprise-only focus.",
    impact: "High",
  },
  {
    title: "Mobile Development Priority",
    description: "Mobile SDK and enhanced mobile experience moved to P0 priority for Q4.",
    impact: "Medium",
  },
  {
    title: "API Partnership Program",
    description: "Greenlit new API partnership program to launch in Q1 2025.",
    impact: "Medium",
  },
]

export default function SummaryPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">CMI</span>
              </div>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold">{mockMeeting.title}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {mockMeeting.time}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {mockMeeting.owner}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mockMeeting.duration}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              {mockMeeting.participants.map((participant, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                  <AvatarFallback className="text-xs">{participant.initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Video & Chapters */}
          <div className="space-y-6 lg:col-span-2">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white/80 text-sm">Q4 Product Strategy Review</p>
                    </div>
                  </div>

                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="space-y-2">
                      {/* Timeline */}
                      <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group">
                        <div className="absolute h-full w-[35%] bg-white rounded-full" />
                        <div className="absolute top-1/2 left-[35%] h-3 w-3 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                            <Play className="h-4 w-4" />
                          </Button>
                          <span className="text-white text-sm font-medium">15:45 / 45:00</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chapters List */}
            <Card>
              <CardHeader>
                <CardTitle>Chapters</CardTitle>
                <CardDescription>Jump to key moments in the meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockChapters.map((chapter) => (
                    <div
                      key={chapter.number}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent hover:border-accent-foreground/20 transition-colors cursor-pointer group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                        {chapter.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{chapter.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{chapter.timestamp}</span>
                          <span>•</span>
                          <span>{chapter.duration}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0 gap-1">
                        Jump
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="space-y-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="decisions">Decisions</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Takeaways</CardTitle>
                    <CardDescription>Main points discussed in this meeting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {mockSummaryPoints.map((point, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Action Items</CardTitle>
                    <CardDescription>Tasks and assignments from this meeting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockActionItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-[200px]">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{item.task}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{item.assignee}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.dueDate}</TableCell>
                            <TableCell>
                              {item.status === "completed" ? (
                                <Badge
                                  variant="default"
                                  className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                >
                                  <Check className="h-3 w-3" />
                                  Done
                                </Badge>
                              ) : item.status === "in-progress" ? (
                                <Badge variant="secondary" className="gap-1">
                                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                                  In Progress
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="decisions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Decisions</CardTitle>
                    <CardDescription>Important decisions made during the meeting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockDecisions.map((decision, i) => (
                        <div key={i} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm">{decision.title}</h4>
                            <Badge variant={decision.impact === "High" ? "default" : "secondary"} className="shrink-0">
                              {decision.impact} Impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{decision.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full gap-2" size="lg">
                <Send className="h-4 w-4" />
                Send Meeting Report
              </Button>
              <Button variant="outline" className="w-full gap-2 bg-transparent" size="lg" asChild>
                <Link href={`/meetings/${params.id}/chat`}>
                  <MessageSquare className="h-4 w-4" />
                  Open Chatbot for this Meeting
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
