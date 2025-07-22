import { createClient } from "@supabase/supabase-js"
import type { User as AppUser, LoginCredentials, CreateUserData } from "../types/user"

/* ───────────────────────── Supabase client ──────────────────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
)

/* ───────────────────────── Helpers ──────────────────────────────── */
const toAppUser = (authUser: any, profile?: any): AppUser => ({
  id: authUser.id,
  email: authUser.email,
  username: profile?.username ?? "",
  role: profile?.role ?? "user",
  createdAt: authUser.created_at,
  updatedAt: profile?.updated_at ?? authUser.created_at,
  isActive: true,
  password: "",
})

/* ───────────────────────── Authentication ───────────────────────── */
export async function loginUser({ username, password }: LoginCredentials): Promise<AppUser | null> {
  try {
    let email = username.trim()

    /* Allow username OR email */
    if (!email.includes("@")) {
      const { data: prof, error: pe } = await supabase.from("profiles").select("email").eq("username", email).single()
      if (pe || !prof) return null
      email = prof.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error || !data.user) return null

    const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    return toAppUser(data.user, prof)
  } catch (err) {
    console.error("Unexpected login error:", err)
    return null
  }
}

export const logoutUser = () => supabase.auth.signOut()

export async function getCurrentUser(): Promise<AppUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null

  const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return toAppUser(session.user, prof)
}

/* ───────────────────────── Admin helpers ──────────────────────────
   These rely on RPCs you created in SQL (or you can rewrite them to
   call your own endpoints). They are NO-OPs if the RPCs are missing. */
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

export async function updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser | null> {
  const { error } = await supabase.rpc("update_user_role", {
    p_user_id: id,
    p_new_role: updates.role,
  })
  if (error) {
    console.error("updateUser RPC error:", error.message)
    return null
  }
  /* re-fetch profile */
  const { data: authUser } = await supabase.auth.admin.getUserById(id)
  const { data: prof } = await supabase.from("profiles").select("*").eq("id", id).single()

  return authUser?.user ? toAppUser(authUser.user, prof) : null
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.rpc("delete_user_by_id", {
    p_user_id: id,
  })
  if (error) console.error("deleteUser RPC error:", error.message)
  return !error
}

/* ───────────────────────── User creation ────────────────────────── */
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

  const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return toAppUser(data.user, prof)
}

/* ───────────────────────── Password rules ───────────────────────── */
export function validatePassword(pw: string): string[] {
  const errs: string[] = []
  if (pw.length < 8) errs.push("≥ 8 characters")
  if (!/[A-Z]/.test(pw)) errs.push("uppercase")
  if (!/[a-z]/.test(pw)) errs.push("lowercase")
  if (!/\d/.test(pw)) errs.push("number")
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) errs.push("special")
  return errs
}

export { supabase } // re-export if other modules need the client
