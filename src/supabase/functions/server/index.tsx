import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Health check
app.get('/make-server-e4147917/health', (c) => {
  return c.json({ status: 'StudyFlow Auth Server running' })
})

// User signup route
app.post('/make-server-e4147917/signup', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, name } = body
    
    // Validate input
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400)
    }

    console.log('Creating new user account for:', email, 'with name:', name)
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      user_metadata: { 
        name: name?.trim() || email.split('@')[0],
        app: 'StudyFlow'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error from Supabase:', error)
      
      if (error.message.includes('already registered')) {
        return c.json({ error: 'An account with this email already exists' }, 400)
      }
      
      if (error.message.includes('weak_password')) {
        return c.json({ error: 'Password is too weak. Please choose a stronger password.' }, 400)
      }
      
      if (error.message.includes('invalid_email')) {
        return c.json({ error: 'Please enter a valid email address' }, 400)
      }
      
      return c.json({ error: error.message }, 400)
    }

    console.log('User created successfully with ID:', data.user?.id)
    return c.json({ 
      success: true, 
      message: 'Account created successfully!',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      }
    })
  } catch (error) {
    console.log('Signup route error:', error)
    return c.json({ error: 'Failed to create user account. Please try again.' }, 500)
  }
})

// Get user profile
app.get('/make-server-e4147917/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log('Profile auth error:', error)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      provider: user.app_metadata?.provider
    })
  } catch (error) {
    console.log('Profile route error:', error)
    return c.json({ error: 'Failed to get user profile' }, 500)
  }
})

// Update user profile
app.put('/make-server-e4147917/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { name } = await c.req.json()
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    
    if (userError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        user_metadata: { 
          ...user.user_metadata,
          name: name
        }
      }
    )

    if (error) {
      console.log('Profile update error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({ 
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      }
    })
  } catch (error) {
    console.log('Profile update route error:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Initialize OAuth providers on startup
console.log('StudyFlow Auth Server starting...')
console.log('OAuth providers available: Google, GitHub, Discord')
console.log('Remember to configure OAuth providers in Supabase dashboard')

Deno.serve(app.fetch)