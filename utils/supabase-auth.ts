import { createClient } from "@supabase/supabase-js"
import type { User as AppUser, CreateUserData } from "../types/user"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

/* Singleton consumer-side Supabase client */
const supabase = createClient(supabaseUrl, supabaseAnon)

/* ───────────────────────── helpers ──────────────────────────────── */
function mapUser(authUser: any, profile: any): AppUser {
  return {
    id: authUser.id,
    email: authUser.email,
    username: profile?.username ?? "",
    role: profile?.role ?? "user",
    createdAt: authUser.created_at,
    updatedAt: profile?.updated_at ?? authUser.created_at,
    isActive: true,
    password: "",
  }
}

/* ───────────────────────── Auth APIs ────────────────────────────── */
export async function loginUser({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<AppUser | null> {
  if (!username || !password) return null

  /* Supabase compares the bcrypt hash server-side */
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username, // we now insist on e-mail sign-in
    password,
  })

  if (error) {
    console.error("Supabase sign-in error:", error.message)
    return null
  }

  /* Fetch matching profile row */
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return mapUser(data.user, profile)
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

  return mapUser(session.user, profile)
}

/* ───────────────────────── Admin RPC wrappers ───────────────────── */
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

export async function createUser({ email, password, username, role }: CreateUserData): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, role } },
  })
  if (error || !data.user) {
    console.error("Error creating user:", error?.message)
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return mapUser(data.user, profile)
}

export async function updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser | null> {
  if (updates.role) {
    const { error } = await supabase.rpc("update_user_role", {
      p_user_id: id,
      p_new_role: updates.role,
    })
    if (error) {
      console.error("Error updating role:", error.message)
      return null
    }
  }

  const { data: authUser } = await supabase.auth.admin.getUserById(id)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single()

  return authUser?.user ? mapUser(authUser.user, profile) : null
}

export async function deleteUser(id: string) {
  const { error } = await supabase.rpc("delete_user_by_id", {
    p_user_id: id,
  })
  if (error) console.error("Delete user error:", error.message)
  return !error
}

/* ───────────────────────── Password helper ──────────────────────── */
export function validatePassword(pw: string) {
  const errs: string[] = []
  if (pw.length < 8) errs.push("≥ 8 characters")
  if (!/[A-Z]/.test(pw)) errs.push("1 uppercase")
  if (!/[a-z]/.test(pw)) errs.push("1 lowercase")
  if (!/\d/.test(pw)) errs.push("1 number")
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) errs.push("1 special character")
  return errs
}

/* Re-export supabase if other utilities need it */
export { supabase }
