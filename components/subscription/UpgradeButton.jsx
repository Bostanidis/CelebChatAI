// components/subscription/UpgradeButton.jsx

import { useState } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'

export default function UpgradeButton({ targetTier }) {
  const [isLoading, setIsLoading] = useState(false)
  const { user, tier: currentTier } = useSubscription()

  const handleUpgrade = async () => {
    if (!user) {
      alert('Please sign in to upgrade your subscription')
      return
    }

    if (currentTier === targetTier.toLowerCase()) {
      alert('You are already subscribed to this tier')
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement Stripe checkout
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: targetTier,
          userId: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to create checkout session')

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading || currentTier === targetTier.toLowerCase()}
      className="w-full py-3 px-4 rounded-xl font-medium text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 dark:shadow-indigo-600/30"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </div>
      ) : currentTier === targetTier.toLowerCase() ? (
        'Current Plan'
      ) : (
        'Upgrade Now'
      )}
    </button>
  )
}