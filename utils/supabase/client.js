import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'sb-auth-token',
    // Using default localStorage adapter for session storage
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  cookies: {
    name: 'sb-auth-token',
    lifetime: 60 * 60 * 24, // 24 hours
    domain: '',
    path: '/',
    sameSite: 'lax',
  },
})

// Add a listener for auth state changes to sync cookies with session state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', event, session?.user?.email)
  
  // When signed in, ensure the cookie is set for middleware authentication
  if (event === 'SIGNED_IN' && session) {
    try {
      if (typeof window !== 'undefined') {
        // Set the cookie with the access token for middleware
        document.cookie = `sb-auth-token=${session.access_token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
        console.log('Set auth cookie on sign in')
      }
    } catch (err) {
      console.error('Error setting auth cookie:', err)
    }
  }
  
  // When user is updated, update the cookie
  if (event === 'USER_UPDATED' && session) {
    try {
      if (typeof window !== 'undefined') {
        document.cookie = `sb-auth-token=${session.access_token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
        console.log('Updated auth cookie on user update')
      }
    } catch (err) {
      console.error('Error updating auth cookie:', err)
    }
  }

  // When signed out, ensure the cookie is removed
  if (event === 'SIGNED_OUT') {
    try {
      if (typeof window !== 'undefined') {
        // Remove the cookie
        document.cookie = `sb-auth-token=; path=/; max-age=0; SameSite=Lax`
        console.log('Removed auth cookie on sign out')
      }
    } catch (err) {
      console.error('Error removing auth cookie:', err)
    }
  }
})

export default supabase
