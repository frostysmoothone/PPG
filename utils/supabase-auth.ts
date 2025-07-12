import { supabase } from "../lib/supabase"
import type { User as AppUser, LoginCredentials, CreateUserData } from "../types/user"

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function mapUser(authUser: any, profile: any): AppUser {
  return {
    id: authUser.id,
    email: authUser.email,
    username: profile?.username ?? "",
    role: profile?.role ?? "user",
    createdAt: authUser.created_at,
    updatedAt: profile?.updated_at ?? authUser.created_at,
    isActive: true,
    password: "", // never expose passwords
  }
}

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

export async function loginUser(credentials: LoginCredentials): Promise<AppUser | null> {
  try {
    let email = credentials.username.trim()

    /* 1️⃣  If the input is not an email, treat it as a username and
       resolve the corresponding email from public.profiles.           */
    if (!email.includes("@")) {
      const { data: profile } = await supabase.from("profiles").select("id").eq("username", email).single()

      if (profile?.id) {
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
        if (authUser?.user?.email) email = authUser.user.email
      }
      // If no profile row, we'll still try sign-in with the original string
    }

    /* 2️⃣  Attempt sign-in with Supabase Auth */
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: credentials.password,
    })
    if (error || !data.user) {
      console.error("Login failed:", error?.message ?? "Invalid credentials")
      return null
    }

    /* 3️⃣  Load profile row */
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    return mapUser(data.user, profile)
  } catch (err) {
    console.error("Unexpected login error:", err)
    return null
  }
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return mapUser(session.user, profile)
}

/* ------------------------------------------------------------------ */
/* User CRUD (admin only)                                             */
/* ------------------------------------------------------------------ */

export async function getUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase.rpc("get_all_users")
  if (error) {
    console.error("Error fetching users:", error.message)
    return []
  }
  return data.map((u: any) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
    createdAt: u.created_at,
    updatedAt: u.created_at,
    isActive: true,
    password: "",
  }))
}

export async function createUser(userData: CreateUserData): Promise<AppUser | null> {
  /* For demo purposes we use signUp (email/password). In production you’d
     likely call supabase.auth.admin.createUser with the Service Key.      */
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

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return mapUser(data.user, profile)
}

export async function updateUser(userId: string, updates: Partial<AppUser>): Promise<AppUser | null> {
  if (updates.role) {
    const { error } = await supabase.rpc("update_user_role", {
      p_user_id: userId,
      p_new_role: updates.role,
    })
    if (error) {
      console.error("Error updating role:", error.message)
      return null
    }
  }

  const { data: authUser } = await supabase.auth.admin.getUserById(userId)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return authUser?.user ? mapUser(authUser.user, profile) : null
}

export async function deleteUser(userId: string): Promise<boolean> {
  const { error } = await supabase.rpc("delete_user_by_id", {
    p_user_id: userId,
  })
  if (error) {
    console.error("Error deleting user:", error.message)
    return false
  }
  return true
}

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

export function validatePassword(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push("Password must be at least 8 characters long.")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.")
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.")
  if (!/\d/.test(password)) errors.push("Password must contain at least one number.")
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Password must contain at least one special character.")
  return errors
}
