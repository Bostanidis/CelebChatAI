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
    storage: {
      getItem: (key) => {
        try {
          // Check if we're in a browser environment
          if (typeof window !== 'undefined') {
            const itemStr = localStorage.getItem(key)
            if (!itemStr) return null
            const item = JSON.parse(itemStr)
            const now = new Date()
            if (now.getTime() > item.expiry) {
              localStorage.removeItem(key)
              return null
            }
            return item.value
          }
          return null
        } catch (err) {
          console.error('Error reading from localStorage:', err)
          return null
        }
      },
      setItem: (key, value) => {
        try {
          // Check if we're in a browser environment
          if (typeof window !== 'undefined') {
            const item = {
              value,
              expiry: new Date().getTime() + 24 * 60 * 60 * 1000, // 24 hours
            }
            localStorage.setItem(key, JSON.stringify(item))
            console.log('Stored auth token in localStorage:', key)
            
            // Also set a cookie for the middleware
            document.cookie = `sb-auth-token=${value}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
            console.log('Set auth cookie for middleware')
          }
        } catch (err) {
          console.error('Error writing to localStorage:', err)
        }
      },
      removeItem: (key) => {
        try {
          // Check if we're in a browser environment
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key)
            console.log('Removed auth token from localStorage:', key)
            
            // Also remove the cookie
            document.cookie = `sb-auth-token=; path=/; max-age=0; SameSite=Lax`
            console.log('Removed auth cookie for middleware')
          }
        } catch (err) {
          console.error('Error removing from localStorage:', err)
        }
      },
    },
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

// Add a listener for auth state changes to log them
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', event, session?.user?.email)
  
  // When signed in, ensure the cookie is set
  if (event === 'SIGNED_IN' && session) {
    try {
      if (typeof window !== 'undefined') {
        // Set the cookie directly
        document.cookie = `sb-auth-token=${session.access_token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
        console.log('Set auth cookie on sign in')
      }
    } catch (err) {
      console.error('Error setting auth cookie:', err)
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
