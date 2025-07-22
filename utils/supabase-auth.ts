import { createClient } from "@supabase/supabase-js"
import type { User as AppUser, LoginCredentials, CreateUserData } from "../types/user"

/* ------------------------------------------------------------------
   Supabase client (singleton on the client side)
   ------------------------------------------------------------------ */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */
function toAppUser(authUser: any, profile?: any): AppUser {
  return {
    id: authUser.id,
    email: authUser.email,
    username: profile?.username ?? "",
    role: profile?.role ?? "user",
    createdAt: authUser.created_at,
    updatedAt: profile?.updated_at ?? authUser.created_at,
    isActive: true,
    password: "", // never expose
  }
}

/* ------------------------------------------------------------------
   Authentication
   ------------------------------------------------------------------ */
export async function loginUser({ username, password }: LoginCredentials): Promise<AppUser | null> {
  try {
    let email = username.trim()

    // If the identifier doesn’t contain “@”, treat it as a username and
    // look up the email in the public.profiles table.
    if (!email.includes("@")) {
      const { data: prof, error } = await supabase.from("profiles").select("email").eq("username", email).single()

      if (error || !prof?.email) return null
      email = prof.email
    }

    // Let Supabase verify the bcrypt-hashed password server-side
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error || !data.user) return null

    // Load the profile row to get username / role
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    return toAppUser(data.user, profile)
  } catch (err) {
    console.error("loginUser error:", err)
    return null
  }
}

export async function logoutUser() {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return toAppUser(session.user, profile)
}

/* ------------------------------------------------------------------
   User-management  (relies on SQL RPCs you created server-side)
   ------------------------------------------------------------------ */
export async function getUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase.rpc("get_all_users")
  if (error || !data) {
    console.error("getUsers RPC error:", error?.message)
    return []
  }
  return data.map((u: any) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
    isActive: true,
    password: "",
  }))
}

export async function createUser({ email, password, username, role }: CreateUserData): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, role, email } },
  })
  if (error || !data.user) {
    console.error("createUser signUp error:", error?.message)
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return toAppUser(data.user, profile)
}

export async function updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser | null> {
  // Example: only role update supported via RPC
  if (!updates.role) return null

  const { error } = await supabase.rpc("update_user_role", {
    p_user_id: id,
    p_new_role: updates.role,
  })
  if (error) {
    console.error("updateUser RPC error:", error.message)
    return null
  }

  // Fetch refreshed row
  const { data: authUser } = await supabase.auth.getUser(id)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single()

  return authUser?.user ? toAppUser(authUser.user, profile) : null
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.rpc("delete_user_by_id", {
    p_user_id: id,
  })
  if (error) console.error("deleteUser RPC error:", error.message)
  return !error
}

/* ------------------------------------------------------------------
   Password-strength helper
   ------------------------------------------------------------------ */
export function validatePassword(pw: string): string[] {
  const errs: string[] = []
  if (pw.length < 8) errs.push("≥ 8 chars")
  if (!/[A-Z]/.test(pw)) errs.push("uppercase")
  if (!/[a-z]/.test(pw)) errs.push("lowercase")
  if (!/\d/.test(pw)) errs.push("number")
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) errs.push("special")
  return errs
}
