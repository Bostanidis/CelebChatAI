"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import SettingsContent from '@/components/settings/SettingsContent'

export default function SettingsPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login?redirectTo=/settings')
    }
  }, [loading, session, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!session) return null

  return (
    <SubscriptionProvider>
      <SettingsContent user={user} />
    </SubscriptionProvider>
  )
} 