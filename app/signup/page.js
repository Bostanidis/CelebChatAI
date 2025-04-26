'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, UserPlus } from 'lucide-react'

// Separate component that uses useSearchParams
function SignUpForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const { signUp } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const { error } = await signUp(formData.email, formData.password)
      if (error) throw error

      router.push(`/login?message=Check your email to confirm your account&redirectTo=${encodeURIComponent(redirectTo)}`)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-background dark:bg-background-dark overflow-hidden">
      {/* Waves at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg width="100%" height="100%" id="svg" viewBox="0 0 1440 390" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0,400 L 0,0 C 81.27272727272728,63.38755980861244 162.54545454545456,126.77511961722487 256,149 C 349.45454545454544,171.22488038277513 455.0909090909091,152.28708133971293 552,136 C 648.9090909090909,119.71291866028707 737.090909090909,106.07655502392345 837,106 C 936.909090909091,105.92344497607655 1048.5454545454545,119.4066985645933 1151,104 C 1253.4545454545455,88.5933014354067 1346.7272727272727,44.29665071770335 1440,0 L 1440,400 L 0,400 Z" stroke="none" strokeWidth="0" fill="#9900ef" fillOpacity="0.4" className="transition-all duration-300 ease-in-out delay-150 path-0 dark:fill-opacity-20" transform="rotate(-180 720 200)"></path>
          <path d="M 0,400 L 0,0 C 88.36363636363635,97.39712918660287 176.7272727272727,194.79425837320574 271,222 C 365.2727272727273,249.20574162679426 465.4545454545456,206.2200956937799 563,193 C 660.5454545454544,179.7799043062201 755.4545454545453,196.32535885167465 845,230 C 934.5454545454547,263.67464114832535 1018.7272727272727,314.47846889952154 1117,279 C 1215.2727272727273,243.52153110047846 1327.6363636363635,121.76076555023923 1440,0 L 1440,400 L 0,400 Z" stroke="none" strokeWidth="0" fill="#9900ef" fillOpacity="0.53" className="transition-all duration-300 ease-in-out delay-150 path-1 dark:fill-opacity-30" transform="rotate(-180 720 200)"></path>
        </svg>
      </div>
  
      <div className="flex-1 flex items-center justify-center z-10 mt-16">
        <div className="max-w-md w-full px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white md:text-foreground dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-white/90 md:text-muted-foreground dark:text-neutral-400">
              Join CelebChat AI and start chatting with your favorite characters
            </p>
          </div>
  
          {/* Form */}
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-lg border shadow-lg p-6 border-primary/10 dark:border-primary/20">
            <form className="space-y-5" onSubmit={handleSignUp}>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-neutral-400" 
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-neutral-400" 
                    aria-hidden="true"
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 w-full h-10 bg-white/50 dark:bg-neutral-800/50 border border-primary/10 dark:border-primary/20 rounded-md text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
                    placeholder="Choose a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    {!showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
  
              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-neutral-400" 
                    aria-hidden="true"
                  />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="pl-10 w-full h-10 bg-white/50 dark:bg-neutral-800/50 border border-primary/10 dark:border-primary/20 rounded-md text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    {!showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
  
              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive dark:text-red-400 text-sm rounded-md p-3">
                  {error}
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    <span>Create account</span>
                  </>
                )}
              </button>
  
              {/* Sign In Link */}
              <p className="mt-4 text-center text-sm text-muted-foreground dark:text-neutral-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/90 focus:outline-none focus:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}

// Main component with Suspense boundary
export default function SignUp() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignUpForm />
    </Suspense>
  )
}
