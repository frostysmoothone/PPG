import { supabase } from "../lib/supabase"
import type { User, LoginCredentials, CreateUserData } from "../types/user"

function dbUserToAppUser(dbUser: any): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    password: "", // Never return password
    role: dbUser.role,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    isActive: dbUser.is_active,
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<User | null> {
  try {
    const { data, error } = await supabase.rpc("handle_login", {
      p_username_or_email: credentials.username,
      p_password: credentials.password,
    })

    if (error || !data) {
      console.error("Login failed:", error?.message || "Invalid credentials.")
      return null
    }

    const { user: rpcUser, session_token } = data
    localStorage.setItem("session_token", session_token)
    localStorage.setItem("current_user", JSON.stringify(rpcUser))

    return rpcUser as User
  } catch (e) {
    console.error("An unexpected error occurred during login:", e)
    return null
  }
}

export async function logoutUser(): Promise<void> {
  const sessionToken = localStorage.getItem("session_token")
  if (sessionToken) {
    try {
      await supabase.rpc("handle_logout", { p_session_token: sessionToken })
    } catch (error) {
      console.error("Logout RPC failed:", error)
    }
  }
  localStorage.removeItem("session_token")
  localStorage.removeItem("current_user")
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionToken = localStorage.getItem("session_token")
  const storedUser = localStorage.getItem("current_user")

  if (!sessionToken || !storedUser) {
    return null
  }

  try {
    const { data: user, error } = await supabase.rpc("verify_session", {
      p_session_token: sessionToken,
    })

    if (error || !user) {
      localStorage.removeItem("session_token")
      localStorage.removeItem("current_user")
      return null
    }

    // Re-store user data to keep it fresh
    localStorage.setItem("current_user", JSON.stringify(user))
    return user as User
  } catch (e) {
    console.error("Get current user error:", e)
    return null
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase.rpc("get_all_users")
    if (error) throw error
    return data.map(dbUserToAppUser)
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function createUser(userData: CreateUserData): Promise<User | null> {
  try {
    const { data, error } = await supabase.rpc("create_new_user", { p_user_data: userData })
    if (error) throw error
    return dbUserToAppUser(data)
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase.rpc("update_user_details", {
      p_user_id: userId,
      p_updates: updates,
    })
    if (error) throw error
    return dbUserToAppUser(data)
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("delete_user_by_id", { p_user_id: userId })
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

export function validatePassword(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push("Password must be at least 8 characters long.")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.")
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.")
  if (!/\d/.test(password)) errors.push("Password must contain at least one number.")
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Password must contain at least one special character.")
  return errors
}
