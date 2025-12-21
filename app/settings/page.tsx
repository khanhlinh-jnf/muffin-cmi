import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User, Globe, Bell } from "lucide-react"
import { AppNav } from "@/components/app-nav"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <AppNav />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>Update your personal information and avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl">JD</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="John Doe" defaultValue="John Doe" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    defaultValue="john.doe@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Preferences</CardTitle>
              </div>
              <CardDescription>Customize your CMI experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="english">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="vietnamese">Vietnamese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="emotion-alert">Emotion Alert Sensitivity</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Control how sensitive the system is to detecting stress and emotional changes during meetings
                  </p>
                  <Select defaultValue="medium">
                    <SelectTrigger id="emotion-alert">
                      <SelectValue placeholder="Select sensitivity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Low</span>
                          <span className="text-xs text-muted-foreground">Only critical stress levels</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Medium</span>
                          <span className="text-xs text-muted-foreground">Balanced detection</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">High</span>
                          <span className="text-xs text-muted-foreground">Detect subtle changes</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button size="lg">Save Changes</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
