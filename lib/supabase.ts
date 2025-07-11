import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface DatabaseUser {
  id: string
  username: string
  email: string
  password_hash: string
  role: "admin" | "user"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseProposal {
  id: string
  user_id: string
  name: string
  data: any
  created_at: string
  updated_at: string
}

export interface DatabaseAppSetting {
  id: string
  key: string
  value: any
  description?: string
  created_at: string
  updated_at: string
}

export interface DatabaseUserSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}
