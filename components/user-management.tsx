"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Edit, Trash2, Eye, EyeOff, Shield, UserIcon } from "lucide-react"
import { getUsers, createUser, updateUser, deleteUser, validatePassword } from "../utils/auth"
import type { User, CreateUserData } from "../types/user"
import { useToast } from "@/hooks/use-toast"

interface UserManagementProps {
  currentUser: User
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    password: "",
    role: "user",
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setUsers(getUsers())
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "user",
    })
    setFormErrors([])
    setShowPassword(false)
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.username.trim()) {
      errors.push("Username is required")
    } else if (formData.username.length < 3) {
      errors.push("Username must be at least 3 characters long")
    }

    if (!formData.email.trim()) {
      errors.push("Email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address")
    }

    if (!editingUser) {
      const passwordErrors = validatePassword(formData.password)
      errors.push(...passwordErrors)
    }

    setFormErrors(errors)
    return errors.length === 0
  }

  const handleCreateUser = () => {
    if (!validateForm()) return

    const existingUsers = getUsers()
    if (existingUsers.some((u) => u.username === formData.username || u.email === formData.email)) {
      setFormErrors(["Username or email already exists"])
      return
    }

    const newUser = createUser(formData)
    if (newUser) {
      loadUsers()
      setShowCreateDialog(false)
      resetForm()
      toast({
        title: "User Created",
        description: `User "${newUser.username}" has been created successfully.`,
      })
    } else {
      setFormErrors(["Failed to create user"])
    }
  }

  const handleUpdateUser = () => {
    if (!editingUser || !validateForm()) return

    const updates: Partial<User> = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
    }

    if (formData.password) {
      updates.password = formData.password
    }

    const updatedUser = updateUser(editingUser.id, updates)
    if (updatedUser) {
      loadUsers()
      setEditingUser(null)
      resetForm()
      toast({
        title: "User Updated",
        description: `User "${updatedUser.username}" has been updated successfully.`,
      })
    } else {
      setFormErrors(["Failed to update user"])
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account.",
        variant: "destructive",
      })
      return
    }

    const success = deleteUser(userId)
    if (success) {
      loadUsers()
      setDeleteUserId(null)
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    })
    setFormErrors([])
  }

  const toggleUserStatus = (user: User) => {
    if (user.id === currentUser.id) {
      toast({
        title: "Error",
        description: "You cannot deactivate your own account.",
        variant: "destructive",
      })
      return
    }

    const updatedUser = updateUser(user.id, { isActive: !user.isActive })
    if (updatedUser) {
      loadUsers()
      toast({
        title: "User Status Updated",
        description: `User "${user.username}" has been ${updatedUser.isActive ? "activated" : "deactivated"}.`,
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (currentUser.role !== "admin") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. They will be able to log in and create proposals.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter username"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter email"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") => setFormData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateUser}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {user.role === "admin" ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{user.username}</h4>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {user.id === currentUser.id && <Badge variant="outline">You</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Created: {formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleUserStatus(user)}
                      disabled={user.id === currentUser.id}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteUserId(user.id)}
                      disabled={user.id === currentUser.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                Username
              </Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave empty to keep current"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "user") => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
