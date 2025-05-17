import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    }
  )

  // Refresh session if needed
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error refreshing session:', error)
    return response
  }

  return response
} 