export interface User {
  id: string
  username: string
  email: string
  password: string // In production, this would be hashed
  role: "admin" | "user"
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  role: "admin" | "user"
}
