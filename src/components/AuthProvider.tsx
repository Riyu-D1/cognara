import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentSession, getCurrentUser } from '../utils/supabase/client'
import { hybridSyncService } from '../services/hybridSync'

interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  provider?: string
}

interface AuthContextType {
  user: User | null
  session: any
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    try {
      const currentSession = await getCurrentSession()
      const currentUser = await getCurrentUser()
      
      setSession(currentSession)
      
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || '',
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
          avatar_url: currentUser.user_metadata?.avatar_url,
          provider: currentUser.app_metadata?.provider
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.log('Error loading user:', error)
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const cleanupUrl = () => {
    // Clean up OAuth callback parameters from URL
    if (window.location.hash || window.location.search.includes('code=')) {
      const url = new URL(window.location.href)
      url.hash = ''
      url.searchParams.delete('code')
      url.searchParams.delete('state')
      window.history.replaceState({}, document.title, url.toString())
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)
      // Clear sync service data before signing out
      hybridSyncService.clearUserData()
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.log('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Handle OAuth callback
    const handleAuthCallback = async () => {
      console.log('Processing OAuth callback...')
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.log('OAuth callback error:', error)
        setLoading(false)
      } else if (data.session) {
        console.log('OAuth callback successful, session found:', data.session.user?.email)
        // Clean up URL after successful authentication
        cleanupUrl()
      } else {
        console.log('No session found during OAuth callback')
        setLoading(false)
      }
    }

    // Check for OAuth callback parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const urlParams = new URLSearchParams(window.location.search)
    
    if (hashParams.get('access_token') || hashParams.get('error') || urlParams.get('code')) {
      console.log('OAuth callback detected in URL')
      handleAuthCallback()
    } else {
      // Load initial session normally
      loadUser()
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        
        if (session?.user) {
          console.log('Processing authenticated user:', {
            email: session.user.email,
            provider: session.user.app_metadata?.provider,
            metadata: session.user.user_metadata
          })

          // Clean up URL if we have a successful session and OAuth callback params
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const urlParams = new URLSearchParams(window.location.search)
          if (hashParams.get('access_token') || urlParams.get('code')) {
            console.log('Cleaning up OAuth callback URL')
            cleanupUrl()
          }
          
          // Create user object with available data
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || 
                  session.user.user_metadata?.name || 
                  session.user.user_metadata?.user_name ||
                  session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url || 
                       session.user.user_metadata?.picture,
            provider: session.user.app_metadata?.provider || 'email'
          }

          console.log('Setting user data:', userData)
          setUser(userData)
          
          // Initialize hybrid sync service for cross-device persistence
          if (event === 'SIGNED_IN' || (event === 'TOKEN_REFRESHED' && userData.id)) {
            hybridSyncService.initializeForUser(userData.id);
          }
        } else {
          setUser(null)
          // Clear sync service when user logs out
          hybridSyncService.clearUserData()
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    session,
    loading,
    signOut: handleSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}