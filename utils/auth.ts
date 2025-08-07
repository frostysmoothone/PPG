import bcrypt from 'bcryptjs'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

// In-memory session storage
let currentUserSession: User | null = null

export async function login(usernameOrEmail: string, password: string): Promise<User> {
  try {
    console.log('Attempting login for:', usernameOrEmail)
    
    // Query the users table by username OR email
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
    
    if (error) {
      console.error('Database error during login:', error.message)
      throw new Error('Database connection failed')
    }

    if (!users || users.length === 0) {
      console.log('No user found with username/email:', usernameOrEmail)
      throw new Error('Invalid username or password')
    }

    const user = users[0]
    console.log('User found:', { id: user.id, username: user.username, password_hash: user.password_hash })

    // Check password - support both bcrypt and plain text for development
    let passwordValid = false
    
    try {
      // Try bcrypt first (check if it looks like a bcrypt hash)
      if (user.password_hash && user.password_hash.startsWith('$2')) {
        passwordValid = await bcrypt.compare(password, user.password_hash)
        console.log('Bcrypt comparison result:', passwordValid)
      } else {
        // Plain text comparison for development
        passwordValid = password === user.password_hash
        console.log('Plain text comparison result:', passwordValid, 'Expected:', user.password_hash, 'Provided:', password)
      }
    } catch (bcryptError) {
      console.log('Bcrypt error, falling back to plain text:', bcryptError)
      // Fallback to plain text comparison
      passwordValid = password === user.password_hash
    }

    if (!passwordValid) {
      console.log('Invalid password for user:', usernameOrEmail)
      throw new Error('Invalid username or password')
    }

    // Create user session object
    const userSession: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }

    // Store session
    currentUserSession = userSession
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(userSession))
    }
    
    console.log('Login successful for user:', usernameOrEmail)
    return userSession
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export function logout(): void {
  currentUserSession = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser')
  }
  console.log('User logged out')
}

export function getCurrentUser(): User | null {
  // Try in-memory first
  if (currentUserSession) {
    return currentUserSession
  }
  
  // Fallback to localStorage (only in browser)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        const user = JSON.parse(stored) as User
        currentUserSession = user
        return user
      }
    } catch (error) {
      console.error('Error parsing stored user:', error)
      localStorage.removeItem('currentUser')
    }
  }
  
  return null
}

export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUsers:', error)
    return []
  }
}

export async function createUser(userData: {
  username: string
  email: string
  password: string
  role: 'admin' | 'user'
}): Promise<User | null> {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: userData.username,
        email: userData.email,
        password_hash: hashedPassword,
        role: userData.role
      }])
      .select('id, username, email, role, created_at, updated_at')
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createUser:', error)
    throw error
  }
}

export async function updateUser(id: string, updates: Partial<User & { password?: string }>): Promise<User | null> {
  try {
    const updateData: any = {}
    
    if (updates.username) updateData.username = updates.username
    if (updates.email) updateData.email = updates.email
    if (updates.role) updateData.role = updates.role
    
    // Hash password if provided
    if (updates.password) {
      updateData.password_hash = await bcrypt.hash(updates.password, 10)
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, email, role, created_at, updated_at')
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateUser:', error)
    throw error
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteUser:', error)
    return false
  }
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function initializeUsers(): Promise<void> {
  try {
    console.log('Checking if admin user exists...')
    
    // Check if admin user exists
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('username, password_hash')
      .eq('username', 'admin')

    if (error) {
      console.error('Error checking for admin user:', error)
      return
    }

    if (!existingUsers || existingUsers.length === 0) {
      console.log('Creating default admin user...')
      
      // Create default admin user with plain text password for development
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          username: 'admin',
          email: 'admin@transferglobal.com',
          password_hash: 'Admin123!', // Plain text for development
          role: 'admin'
        }])

      if (insertError) {
        console.error('Error creating default admin user:', insertError)
      } else {
        console.log('Default admin user created successfully')
        console.log('Username: admin')
        console.log('Password: Admin123!')
      }
    } else {
      console.log('Admin user already exists with password hash:', existingUsers[0].password_hash)
    }
  } catch (error) {
    console.error('Error initializing users:', error)
  }
}
