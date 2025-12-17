"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder for future API integration
    setError("")
    console.log("Login attempt:", { email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Image src="/icon.svg" alt="CMI Logo" width={40} height={40} className="dark:invert" />
              <span className="text-2xl font-semibold">CMI</span>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Sign in to CMI</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm text-destructive text-center py-2">{error}</div>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to dashboard
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
