"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, FileText, Users, UserIcon } from 'lucide-react'
import { getCurrentUser, logout, initializeUsers } from "../utils/auth"
import { LoginForm } from "./login-form"
import { UserManagement } from "./user-management"
import PDFGenerator from "./pdf-generator"
import type { User } from "../types/user"
import { useToast } from "@/hooks/use-toast"

export default function AppLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeUsers()
        const user = getCurrentUser()
        setCurrentUser(user)
        
        if (user) {
          console.log('User authenticated:', user.username)
        } else {
          console.log('No authenticated user found')
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    console.log('User logged in:', user.username)
    toast({
      title: "Welcome back!",
      description: `Logged in as ${user.username}`,
    })
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    console.log('User logged out')
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
          <TabsList className="grid w-full grid-cols-2 max-w-md">
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
          </TabsList>

          <TabsContent value="proposals" className="mt-6">
            <PDFGenerator />
          </TabsContent>

          {currentUser.role === "admin" && (
            <TabsContent value="users" className="mt-6">
              <UserManagement currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
