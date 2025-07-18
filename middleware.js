import { NextResponse } from 'next/server'
import supabase from '@/utils/supabase/server'

// Protected routes that require authentication
const protectedRoutes = ['/settings', '/profile', '/subscription', '/debug']

// Public routes that should never redirect
const publicRoutes = ['/', '/login', '/signup']

// Session timeout in minutes
const SESSION_TIMEOUT = 30

export async function middleware(request) {
  try {
    const path = request.nextUrl.pathname
    console.log('Middleware processing path:', path)

    // Always allow public routes without any checks
    if (publicRoutes.includes(path)) {
      console.log('Middleware - Public route access granted:', path)
      return NextResponse.next()
    }

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    console.log('Is protected route:', isProtectedRoute)

    // Get the session cookie from the request
    const supabaseSession = request.cookies.get('sb-auth-token')?.value
    console.log('Auth token exists:', supabaseSession ? 'Yes' : 'No')

    // If it's a protected route and there's no session cookie, redirect to login
    if (isProtectedRoute && !supabaseSession) {
      console.log('Middleware - Redirecting to login from protected route:', path)
      return redirectToLogin(request)
    }

    // Allow access to all other routes without redirection
    console.log('Middleware - Access granted to path:', path)
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // Only redirect to login for protected routes
    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      console.log('Middleware - Error occurred, redirecting to login from:', request.nextUrl.pathname)
      return redirectToLogin(request)
    }
    console.log('Middleware - Error occurred but allowing access to:', request.nextUrl.pathname)
    return NextResponse.next()
  }
}

function redirectToLogin(request) {
  const redirectUrl = new URL('/login', request.url)
  redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 