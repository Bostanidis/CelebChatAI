'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import supabase from '@/utils/supabase/client'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const { session, loading: authLoading } = useAuth()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setMessage(message)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth state in login page:', { session, authLoading, redirectTo })
    if (session && !authLoading) {
      console.log('Redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [session, authLoading, router, redirectTo])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log('Attempting to sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      if (data?.user) {
        console.log('Sign in successful, redirecting to:', redirectTo)
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-background dark:bg-background-dark overflow-hidden">
      {/* Waves at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg width="100%" height="100%" id="svg" viewBox="0 0 1440 490" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0,500 L 0,318 C 84.22966507177034,311.2631578947369 168.45933014354068,304.5263157894737 253,291 C 337.5406698564593,277.4736842105263 422.3923444976076,257.1578947368421 526,235 C 629.6076555023924,212.84210526315792 751.9712918660288,188.84210526315792 864,158 C 976.0287081339712,127.1578947368421 1077.7224880382776,89.4736842105263 1172,65 C 1266.2775119617224,40.52631578947369 1353.1387559808613,29.263157894736846 1440,18 L 1440,500 L 0,500 Z" stroke="none" strokeWidth="0" fill="#9900ef" fillOpacity="0.4" className="transition-all duration-300 ease-in-out delay-150 path-0 dark:fill-opacity-20" transform="rotate(-180 720 250)"></path>
          <path d="M 0,500 L 0,443 C 90.47846889952152,438.86602870813397 180.95693779904303,434.732057416268 283,414 C 385.04306220095697,393.267942583732 498.6507177033493,355.9377990430622 587,341 C 675.3492822966507,326.0622009569378 738.4401913875599,333.51674641148327 824,317 C 909.5598086124401,300.48325358851673 1017.5885167464114,259.99521531100476 1124,227 C 1230.4114832535886,194.00478468899524 1335.2057416267944,168.50239234449762 1440,143 L 1440,500 L 0,500 Z" stroke="none" strokeWidth="0" fill="#9900ef" fillOpacity="0.53" className="transition-all duration-300 ease-in-out delay-150 path-1 dark:fill-opacity-30" transform="rotate(-180 720 250)"></path>
          <path d="M 0,500 L 0,568 C 92.01913875598089,587.7224880382776 184.03827751196178,607.444976076555 281,601 C 377.9617224880382,594.555023923445 479.86602870813385,561.9425837320574 581,522 C 682.1339712918661,482.0574162679426 782.4976076555024,434.78468899521533 880,403 C 977.5023923444976,371.21531100478467 1072.1435406698565,354.91866028708137 1165,335 C 1257.8564593301435,315.08133971291863 1348.9282296650717,291.5406698564593 1440,268 L 1440,500 L 0,500 Z" stroke="none" strokeWidth="0" fill="#9900ef" fillOpacity="1" className="transition-all duration-300 ease-in-out delay-150 path-2 dark:fill-opacity-40" transform="rotate(-180 720 250)"></path>
        </svg>
      </div>
      
      <div className="flex-1 flex items-center justify-center z-10 mt-16">
        <div className="max-w-md w-full px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white md:text-foreground dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-white/90 md:text-muted-foreground dark:text-neutral-400">
              Sign in to continue chatting with your favorite characters
            </p>
          </div>
  
          {/* Form */}
          <div className="bg-white/80 dark:bg-neutral-900/80 rounded-lg border shadow-lg p-6 border-primary/10 dark:border-primary/20">
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground dark:text-neutral-400" 
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    className="pl-10 w-full h-10 bg-white/50 dark:bg-neutral-800/50 border border-primary/10 dark:border-primary/20 rounded-md text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
  
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground dark:text-neutral-400" 
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 w-full h-10 bg-white/50 dark:bg-neutral-800/50 border border-primary/10 dark:border-primary/20 rounded-md text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    {!showPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
  
              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive dark:text-red-400 text-sm rounded-md p-3">
                  {error}
                </div>
              )}
  
              {/* Success Message */}
              {message && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm rounded-md p-3">
                  {message}
                </div>
              )}
  
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-[18px] h-[18px]" strokeWidth={1.5} aria-hidden="true" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
  
              {/* Sign Up Link */}
              <div className="text-center text-sm">
                <Link
                  href="/signup"
                  className="text-primary hover:text-primary/90 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Don&apos;t have an account? Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 