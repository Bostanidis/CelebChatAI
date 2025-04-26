"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import SubscriptionContent from '@/components/subscription/SubscriptionContent'

export default function SubscriptionPage() {
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!authLoading && !session && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/login?redirectTo=/subscription')
    }
  }, [authLoading, session, router, isRedirecting])

  if (authLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading subscription details...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <SubscriptionProvider>
      <SubscriptionContent user={user} />
    </SubscriptionProvider>
  )
} 