"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Loader2 } from 'lucide-react'

function ProfileContent() {
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const { tier } = useSubscription()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Set subscription data from context
        const subscription = {
          tier: tier || 'Free',
          status: 'active',
          nextBilling: '2024-05-01',
          price: tier === 'Pro' ? '$9.99' : '$0'
        }
        
        // Fetch recent activity (mock data for now)
        setRecentActivity([
          { id: 1, type: 'chat', character: 'Sherlock Holmes', date: '2024-04-01', duration: '15 min' },
          { id: 2, type: 'chat', character: 'Marie Curie', date: '2024-03-30', duration: '20 min' },
          { id: 3, type: 'chat', character: 'Leonardo da Vinci', date: '2024-03-28', duration: '25 min' }
        ])
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchUserData()
    }
  }, [user, tier])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Account Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Member Since:</span> {new Date(user?.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Subscription</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Current Plan:</span> {tier}</p>
                <p><span className="font-medium">Status:</span> Active</p>
                <p><span className="font-medium">Next Billing:</span> May 1, 2024</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{activity.character}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {activity.date} • {activity.duration}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && !session && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/login?redirectTo=/profile')
    }
  }, [loading, session, router, isRedirecting])

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!session) return null

  return <ProfileContent />
}