"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { login } from "../utils/auth"
import type { LoginCredentials, User } from "../types/user"

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await login(credentials.username, credentials.password)
      if (user) {
        onLogin(user)
      } else {
        setError("Invalid username/email or password")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Payment Processing Proposal Generator account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Default Admin Credentials:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>
                <strong>Username:</strong> admin
              </div>
              <div>
                <strong>Email:</strong> admin@transferglobal.com
              </div>
              <div>
                <strong>Password:</strong> Admin123!
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">Use these credentials to log in and create additional users.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
