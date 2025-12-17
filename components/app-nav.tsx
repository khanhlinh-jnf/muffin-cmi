"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, CheckSquare, Settings, LogOut } from "lucide-react"

const navItems = [
  {
    title: "Meetings",
    href: "/",
    icon: Home,
  },
  {
    title: "My Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">CMI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Cross Meeting Intelligence</h1>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className={cn("gap-2", pathname === item.href && "bg-muted")}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="icon" title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
