'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Loader2 } from 'lucide-react'

export default function SettingsContent({ user }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const { signOut } = useAuth()
  const { tier } = useSubscription()

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      setMessage({ type: 'error', text: 'Failed to sign out. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Current Plan:</span> {tier}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Receive email updates about your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Use dark theme across the application
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                <span>Sign Out</span>
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 