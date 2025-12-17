import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, ArrowUpDown, ExternalLink } from "lucide-react"
import Link from "next/link"
import { AppNav } from "@/components/app-nav"

// Mock data for action items
const mockTasks = [
  {
    id: 1,
    description: "Prepare Q4 budget presentation for executive review",
    meeting: { id: 1, title: "Q4 Product Strategy Review" },
    dueDate: "2024-01-18",
    status: "todo",
  },
  {
    id: 2,
    description: "Review and approve new feature specifications",
    meeting: { id: 2, title: "Engineering Sprint Planning" },
    dueDate: "2024-01-16",
    status: "in-progress",
  },
  {
    id: 3,
    description: "Send onboarding materials to new client",
    meeting: { id: 3, title: "Client Onboarding Call" },
    dueDate: "2024-01-15",
    status: "in-progress",
  },
  {
    id: 4,
    description: "Update marketing campaign metrics dashboard",
    meeting: { id: 4, title: "Marketing Campaign Sync" },
    dueDate: "2024-01-20",
    status: "todo",
  },
  {
    id: 5,
    description: "Document design system component guidelines",
    meeting: { id: 5, title: "Design System Review" },
    dueDate: "2024-01-14",
    status: "done",
  },
  {
    id: 6,
    description: "Schedule follow-up meeting with stakeholders",
    meeting: { id: 1, title: "Q4 Product Strategy Review" },
    dueDate: "2024-01-17",
    status: "todo",
  },
]

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Action Items</h2>
            <p className="text-muted-foreground">Track and manage action items from all your meetings</p>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To-do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all-dates">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-dates">All Dates</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="today">Due Today</SelectItem>
                  <SelectItem value="this-week">Due This Week</SelectItem>
                  <SelectItem value="this-month">Due This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ArrowUpDown className="h-4 w-4" />
                Sort by Deadline
              </Button>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Task Description</TableHead>
                  <TableHead>Meeting</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.description}</TableCell>
                    <TableCell>
                      <Link
                        href={`/meetings/${task.meeting.id}/summary`}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        {task.meeting.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{task.dueDate}</TableCell>
                    <TableCell>
                      <Select defaultValue={task.status}>
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                To-do
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="in-progress">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                In Progress
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="done">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Done
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}
