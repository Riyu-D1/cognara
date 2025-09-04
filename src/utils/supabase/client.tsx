import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

// Helper function to get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.log('Session error:', error)
      return null
    }
    return session
  } catch (error) {
    console.log('Get session error:', error)
    return null
  }
}

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.log('User error:', error)
      return null
    }
    return user
  } catch (error) {
    console.log('Get user error:', error)
    return null
  }
}

// OAuth sign in
export const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
  try {
    console.log(`Initiating ${provider} OAuth sign in...`)
    console.log('Current URL origin:', window.location.origin)
    
    // Use dynamic URL detection
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cognara.vercel.app'
    
    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      console.log(`OAuth ${provider} sign in error:`, error)
      if (error.message.includes('provider is not enabled')) {
        throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not configured yet. Please use email/password or ask your admin to set up ${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication.`)
      }
      throw error
    }
    
    console.log(`OAuth ${provider} redirect initiated:`, data)
    return data
  } catch (error) {
    console.log(`Failed to sign in with ${provider}:`, error)
    throw error
  }
}

// Email/password sign in
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.log('Email sign in error:', error)
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.')
      }
      throw new Error(error.message || 'Sign in failed')
    }
    
    return data
  } catch (error) {
    console.log('Failed to sign in with email:', error)
    throw error
  }
}

// Sign up with email
export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  try {
    // Call our custom signup endpoint
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e4147917/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.log('Signup error response:', result)
      if (result.error && result.error.includes('already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      }
      throw new Error(result.error || 'Account creation failed. Please try again.')
    }
    
    console.log('Signup successful, now signing in...')
    // After successful signup, sign them in
    return await signInWithEmail(email, password)
  } catch (error: any) {
    console.log('Failed to sign up:', error)
    if (error.message) {
      throw error
    }
    throw new Error('Account creation failed. Please check your connection and try again.')
  }
}

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.log('Sign out error:', error)
      throw error
    }
  } catch (error) {
    console.log('Failed to sign out:', error)
    throw error
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}