// components/subscription/TierCard.jsx

import { useSubscription } from '../../contexts/SubscriptionContext'
import UpgradeButton from './UpgradeButton'

export default function TierCard({ tier, price, features, isPopular }) {
  const { tier: currentTier } = useSubscription()
  const isCurrentTier = currentTier === tier.toLowerCase()

  // Determine gradient based on tier
  const getGradients = () => {
    if (tier === 'Ultra') {
      return {
        border: 'from-purple-500 via-indigo-500 to-purple-500',
        badge: 'from-purple-500 to-indigo-600',
        button: 'from-purple-600 to-indigo-600'
      }
    } else if (tier === 'Pro') {
      return {
        border: 'from-indigo-500 via-blue-500 to-indigo-500',
        badge: 'from-indigo-500 to-blue-600', 
        button: 'from-indigo-600 to-blue-600'
      }
    }
    // Free tier
    return {
      border: 'from-neutral-400 via-neutral-500 to-neutral-400 dark:from-neutral-600 dark:via-neutral-700 dark:to-neutral-600',
      badge: 'from-neutral-400 to-neutral-500 dark:from-neutral-600 dark:to-neutral-700',
      button: 'from-neutral-500 to-neutral-600 dark:from-neutral-700 dark:to-neutral-800'
    }
  }

  const gradients = getGradients()

  return (
    <div className={`
      relative rounded-2xl overflow-hidden
      ${isCurrentTier || isPopular ? 'transform-gpu -translate-y-2' : ''}
      transition-all duration-300 group hover:scale-[1.02]
    `}>
      {/* Animated gradient border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradients.border} ${isPopular ? 'animate-gradient' : ''} rounded-2xl p-[2px]`}>
        <div className="absolute inset-0 bg-white dark:bg-neutral-900 rounded-2xl"></div>
      </div>
      
      {/* Card content */}
      <div className="relative p-8 bg-white dark:bg-neutral-900 rounded-2xl h-full flex flex-col">
        {/* Popular badge */}
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full blur-sm opacity-80"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
            </div>
          </div>
        )}

        {/* Current plan indicator */}
        {isCurrentTier && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-sm opacity-80"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium px-4 py-1 rounded-full shadow-lg">
                Current Plan
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">{tier}</h3>
          <div className="flex justify-center items-baseline">
            <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300">${price}</span>
            <span className="ml-1 text-2xl font-medium text-neutral-500 dark:text-neutral-400">/mo</span>
          </div>
        </div>

        <ul className="space-y-4 flex-grow mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex space-x-3 items-start">
              <div className="relative flex-shrink-0 mt-1">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-sm opacity-70"></div>
                <div className="relative w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <svg
                    className="h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <span className="text-base text-neutral-700 dark:text-neutral-300">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          {isCurrentTier ? (
            <button
              className="w-full py-3 px-4 rounded-xl font-medium text-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed border border-neutral-200 dark:border-neutral-700"
              disabled
            >
              Current Plan
            </button>
          ) : (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-sm opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <UpgradeButton targetTier={tier} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}