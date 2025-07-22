"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, Eye, EyeOff } from "lucide-react"
import type { LoginCredentials } from "@/types/user"

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<unknown | null>
}

/* ------------------------------------------------------------------ */
/*  Named export expected elsewhere in the app                         */
/* ------------------------------------------------------------------ */
export function LoginForm({ onLogin }: LoginFormProps) {
  const [creds, setCreds] = useState<LoginCredentials>({
    username: "",
    password: "",
  })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError("")
    const user = await onLogin(creds)
    if (!user) setError("Invalid e-mail or password")
    setPending(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" /> Sign in
          </CardTitle>
          <CardDescription>Use the e-mail and password created in Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                disabled={pending}
                value={creds.username}
                onChange={(e) => setCreds((c) => ({ ...c, username: e.target.value.trim() }))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  disabled={pending}
                  value={creds.password}
                  onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPw((s) => !s)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

/* Still export as default in case other files import default */
export default LoginForm
