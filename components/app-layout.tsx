"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, FileText, Users, UserIcon, Settings } from "lucide-react"
import { LoginForm } from "./login-form"
import { UserManagement } from "./user-management"
import PDFGenerator from "./pdf-generator"
import type { User } from "../types/user"
import { useToast } from "@/hooks/use-toast"
import { SettingsManagement } from "./settings-management"
import { loginUser, logoutUser, getCurrentUser } from "../utils/supabase-auth"
import type { LoginCredentials } from "../types/auth"

export default function AppLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const initApp = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
      setIsLoading(false)
    }
    initApp()
  }, [])

  const handleLogin = async (credentials: LoginCredentials) => {
    const user = await loginUser(credentials)
    if (user) {
      setCurrentUser(user)
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.username}`,
      })
    }
    return user
  }

  const handleLogout = async () => {
    await logoutUser()
    setCurrentUser(null)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Payment Processing Proposal Generator</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{currentUser.username}</span>
              <Badge variant={currentUser.role === "admin" ? "default" : "secondary"}>{currentUser.role}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <Tabs defaultValue="proposals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Proposals
            </TabsTrigger>
            {currentUser.role === "admin" && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            )}
            {currentUser.role === "admin" && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="proposals" className="mt-6">
            <PDFGenerator />
          </TabsContent>

          {currentUser.role === "admin" && (
            <TabsContent value="users" className="mt-6">
              <UserManagement currentUser={currentUser} />
            </TabsContent>
          )}
          {currentUser.role === "admin" && (
            <TabsContent value="settings" className="mt-6">
              <SettingsManagement currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
