import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

// Create a server-side Supabase client for the middleware
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session on server
    autoRefreshToken: false, // Don't auto refresh on server
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-server',
    },
  },
})

// Log configuration to help debug
console.log('Server-side Supabase client initialized with URL:', supabaseUrl)

export { createClient }
export default supabase