import React, { useState, useEffect } from 'react'
import { BookOpen, Mail, Eye, EyeOff, Github } from 'lucide-react'
import { signInWithOAuth, signInWithEmail, signUpWithEmail } from '../utils/supabase/client'

interface AuthPageProps {
  onSuccess?: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    // Check for OAuth callback parameters and errors
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const urlParams = new URLSearchParams(window.location.search)
    
    const errorParam = hashParams.get('error') || urlParams.get('error')
    const errorDescription = hashParams.get('error_description') || urlParams.get('error_description')
    const accessToken = hashParams.get('access_token')
    const code = urlParams.get('code')
    
    if (errorParam) {
      setError(`OAuth Error: ${errorDescription || errorParam}`)
      setDebugInfo(`Error details: ${errorParam} - ${errorDescription}`)
    } else if (accessToken || code) {
      setDebugInfo(`OAuth callback detected: ${accessToken ? 'token' : 'code'} flow`)
    }
  }, [])

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'discord') => {
    try {
      setLoading(true)
      setError(null)
      console.log(`Starting ${provider} OAuth flow...`)
      await signInWithOAuth(provider)
      // The redirect will happen automatically, so we don't need to do anything else
      console.log(`${provider} OAuth redirect should have started`)
    } catch (error: any) {
      console.log(`OAuth ${provider} error:`, error)
      setError(error.message || `Failed to sign in with ${provider}`)
      setLoading(false)
    }
    // Note: Don't set loading to false here as the redirect will handle it
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (isSignUp && name && name.trim().length < 2) {
      setError('Please enter your full name')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (isSignUp) {
        console.log('Attempting signup with:', email, name)
        await signUpWithEmail(email.trim(), password, name?.trim())
      } else {
        console.log('Attempting signin with:', email)
        await signInWithEmail(email.trim(), password)
      }
      
      onSuccess?.()
    } catch (error: any) {
      console.log('Auth error:', error)
      setError(error.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            StudyNet
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl">
              <p className="text-blue-600 text-xs">{debugInfo}</p>
              <p className="text-blue-500 text-xs mt-1">Current URL: {window.location.href}</p>
            </div>
          )}

          {/* Email Form - Now Primary */}

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-11 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder={isSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Switch between Sign In / Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setEmail('')
                  setPassword('')
                  setName('')
                }}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* OAuth Options - Secondary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500 mb-4">
              Or continue with Google
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Continue with Google"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing, you agree to StudyNet's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}