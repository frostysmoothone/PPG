import type { User, LoginCredentials, CreateUserData } from "../types/user"

const USERS_STORAGE_KEY = "app-users"
const AUTH_STORAGE_KEY = "current-user"

// Default admin user credentials
const DEFAULT_ADMIN: User = {
  id: "admin-001",
  username: "admin",
  email: "admin@transferglobal.com",
  password: "Admin123!", // In production, this would be hashed
  role: "admin",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
}

export function initializeUsers(): void {
  if (typeof window === "undefined") return

  const existingUsers = getUsers()
  if (existingUsers.length === 0) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]))
  }
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading users:", error)
    return []
  }
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

export function login(credentials: LoginCredentials): User | null {
  const users = getUsers()
  const user = users.find(
    (u) =>
      (u.username === credentials.username || u.email === credentials.username) &&
      u.password === credentials.password &&
      u.isActive,
  )

  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    return user
  }

  return null
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("Error loading current user:", error)
    return null
  }
}

export function createUser(userData: CreateUserData): User | null {
  const users = getUsers()

  // Check if username or email already exists
  if (users.some((u) => u.username === userData.username || u.email === userData.email)) {
    return null
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  }

  users.push(newUser)
  saveUsers(users)
  return newUser
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) return null

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveUsers(users)
  return users[userIndex]
}

export function deleteUser(userId: string): boolean {
  const users = getUsers()
  const filteredUsers = users.filter((u) => u.id !== userId)

  if (filteredUsers.length === users.length) return false

  saveUsers(filteredUsers)
  return true
}

export function validatePassword(password: string): string[] {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return errors
}
