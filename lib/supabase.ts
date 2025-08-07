import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We handle our own session management
  },
})

export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }

    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}
