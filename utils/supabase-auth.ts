import { supabase } from "../lib/supabase"
import type { User, LoginCredentials, CreateUserData } from "../types/user"

// This maps the user data from Supabase Auth and our public.profiles table
// into the User type used by the application.
function a(user: any, profile: any): User {
  return {
    id: user.id,
    email: user.email,
    username: profile?.username || "",
    role: profile?.role || "user",
    createdAt: user.created_at,
    updatedAt: profile?.updated_at || user.created_at,
    isActive: true, // Supabase Auth handles this via email confirmation, etc.
    password: "", // Never handle passwords on the client
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.username, // Use email for login
    password: credentials.password,
  })

  if (error || !data.user) {
    console.error("Login failed:", error?.message)
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()

  if (profileError) {
    console.error("Failed to fetch user profile:", profileError.message)
    return null
  }

  return a(data.user, profile)
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return null
  }

  return a(session.user, profile)
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.rpc("get_all_users")

  if (error) {
    console.error("Error fetching users:", error.message)
    return []
  }

  // The RPC returns a combined view of auth.users and public.profiles
  return data.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.created_at, // Simplified for this example
    isActive: true,
    password: "",
  }))
}

export async function createUser(userData: CreateUserData): Promise<User | null> {
  // Use the admin client to create users without requiring email confirmation for this demo.
  // In a real app, you'd handle this differently.
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        username: userData.username,
        role: userData.role,
      },
    },
  })

  if (error || !data.user) {
    console.error("Error creating user:", error?.message)
    return null
  }

  // The trigger `on_auth_user_created` will create the profile.
  // We just need to fetch it to return the full User object.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()

  if (profileError) {
    console.error("Failed to fetch new user's profile:", profileError.message)
    return null
  }

  return a(data.user, profile)
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  if (updates.role) {
    const { error } = await supabase.rpc("update_user_role", {
      p_user_id: userId,
      p_new_role: updates.role,
    })
    if (error) {
      console.error("Error updating user role:", error.message)
      return null
    }
  }
  // Fetch the updated user data to return it
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
  if (userError) return null
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()
  if (profileError) return null

  return a(user.user, profile)
}

export async function deleteUser(userId: string): Promise<boolean> {
  const { error } = await supabase.rpc("delete_user_by_id", { p_user_id: userId })
  if (error) {
    console.error("Error deleting user:", error.message)
    return false
  }
  return true
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
