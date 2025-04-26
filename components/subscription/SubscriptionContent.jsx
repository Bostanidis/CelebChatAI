'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Loader2 } from 'lucide-react'

export default function SubscriptionContent({ user }) {
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState(null)
  const router = useRouter()
  const { tier } = useSubscription()

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      features: [
        'Access to basic characters',
        'Limited messages per day',
        'Standard response time',
        'Basic chat features'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline'
    },
    {
      name: 'Pro',
      price: '$9.99',
      features: [
        'Access to all characters',
        'Unlimited messages',
        'Priority response time',
        'Advanced chat features',
        'Custom character creation',
        'Voice messages'
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Everything in Pro',
        'Custom AI model training',
        'Dedicated support',
        'API access',
        'Team management',
        'Custom integrations'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline'
    }
  ]

  const handleSubscribe = async (tier) => {
    setLoading(true)
    setSelectedTier(tier)
    
    try {
      // TODO: Implement actual subscription logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/profile')
    } catch (error) {
      console.error('Error subscribing:', error)
    } finally {
      setLoading(false)
      setSelectedTier(null)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                  {tier.name}
                </h2>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
                  {tier.price}
                  <span className="text-base font-normal text-neutral-600 dark:text-neutral-400">
                    /month
                  </span>
                </p>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loading && selectedTier === tier}
                  className={`w-full py-2 px-4 rounded-md ${
                    loading && selectedTier === tier
                      ? 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                      : tier.buttonVariant === 'default'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white'
                  }`}
                >
                  {loading && selectedTier === tier ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    tier.buttonText
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                We accept all major credit cards, PayPal, and various other payment methods.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}