import { supabase } from "../lib/supabase"
import type { User, LoginCredentials, CreateUserData } from "../types/user"
import type { DatabaseUser } from "../lib/supabase"

// Simple hash function for development (replace with proper bcrypt in production)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash
}

// Convert database user to app user type
function dbUserToUser(dbUser: DatabaseUser): User {
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

export async function initializeDatabase(): Promise<void> {
  try {
    // Check if admin user exists
    const { data: adminUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("username", "admin")
      .single()

    if (checkError && checkError.code === "PGRST116") {
      // User doesn't exist, create default admin user
      const hashedPassword = simpleHash("Admin123!")

      const { error: insertError } = await supabase.from("users").insert({
        username: "admin",
        email: "admin@transferglobal.com",
        password_hash: hashedPassword,
        role: "admin",
        is_active: true,
      })

      if (insertError) {
        console.error("Error creating admin user:", insertError)
      } else {
        console.log("Default admin user created successfully")
      }
    } else if (checkError) {
      console.error("Error checking for admin user:", checkError)
    }
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<User | null> {
  try {
    // Find user by username or email
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${credentials.username},email.eq.${credentials.username}`)
      .eq("is_active", true)
      .single()

    if (error || !dbUser) {
      console.error("User not found or error:", error)
      return null
    }

    // Verify password
    const isValidPassword = verifyPassword(credentials.password, dbUser.password_hash)
    if (!isValidPassword) {
      console.error("Invalid password")
      return null
    }

    // Create session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 8) // 8 hour session

    const { error: sessionError } = await supabase.from("user_sessions").insert({
      user_id: dbUser.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Error creating session:", sessionError)
    }

    // Store session in localStorage
    const user = dbUserToUser(dbUser)
    localStorage.setItem("session_token", sessionToken)
    localStorage.setItem("current_user", JSON.stringify(user))

    return user
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const sessionToken = localStorage.getItem("session_token")
    if (sessionToken) {
      // Remove session from database
      await supabase.from("user_sessions").delete().eq("session_token", sessionToken)
    }

    // Clear localStorage
    localStorage.removeItem("session_token")
    localStorage.removeItem("current_user")
  } catch (error) {
    console.error("Logout error:", error)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const sessionToken = localStorage.getItem("session_token")
    const storedUser = localStorage.getItem("current_user")

    if (!sessionToken || !storedUser) {
      return null
    }

    // Verify session is still valid
    const { data: session, error } = await supabase
      .from("user_sessions")
      .select("user_id, expires_at")
      .eq("session_token", sessionToken)
      .single()

    if (error || !session) {
      // Invalid session, clear storage
      localStorage.removeItem("session_token")
      localStorage.removeItem("current_user")
      return null
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Session expired, clean up
      await supabase.from("user_sessions").delete().eq("session_token", sessionToken)

      localStorage.removeItem("session_token")
      localStorage.removeItem("current_user")
      return null
    }

    return JSON.parse(storedUser)
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const { data: dbUsers, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    return dbUsers.map(dbUserToUser)
  } catch (error) {
    console.error("Get users error:", error)
    return []
  }
}

export async function createUser(userData: CreateUserData): Promise<User | null> {
  try {
    // Check if username or email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)
      .single()

    if (existingUser) {
      return null // User already exists
    }

    // Hash password
    const hashedPassword = simpleHash(userData.password)

    // Insert new user
    const { data: dbUser, error } = await supabase
      .from("users")
      .insert({
        username: userData.username,
        email: userData.email,
        password_hash: hashedPassword,
        role: userData.role,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }

    return dbUserToUser(dbUser)
  } catch (error) {
    console.error("Create user error:", error)
    return null
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const dbUpdates: any = {}

    if (updates.username) dbUpdates.username = updates.username
    if (updates.email) dbUpdates.email = updates.email
    if (updates.role) dbUpdates.role = updates.role
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    // Hash password if provided
    if (updates.password) {
      dbUpdates.password_hash = simpleHash(updates.password)
    }

    const { data: dbUser, error } = await supabase.from("users").update(dbUpdates).eq("id", userId).select().single()

    if (error) {
      console.error("Error updating user:", error)
      return null
    }

    return dbUserToUser(dbUser)
  } catch (error) {
    console.error("Update user error:", error)
    return null
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Delete user error:", error)
    return false
  }
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
