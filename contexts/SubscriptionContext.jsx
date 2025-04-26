"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import supabase from '@/utils/supabase/client'
import { saveChat } from '@/lib/supabase'

const SubscriptionContext = createContext()

const TIERS = {
  FREE: 'FREE',
  PRO: 'PRO',
  ULTRA: 'ULTRA',
  GUEST: 'GUEST',
  ADMIN: 'ADMIN'
}

const MESSAGE_LIMITS = {
  GUEST: 10,      // Guest users can send 3 messages per session
  FREE: 30,      // Free tier users can send 20 messages per day
  PRO: Infinity, // Pro users have unlimited messages
  ULTRA: Infinity, // Ultra users have unlimited messages
  ADMIN: Infinity  // Admin users have unlimited messages
}

export function SubscriptionProvider({ children }) {
  const { user, session } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guestMessageCount, setGuestMessageCount] = useState(0)
  
  // Get user session and subscription data
  useEffect(() => {
    if (!session) {
      // Set guest tier for unauthenticated users
      setSubscription({
        tier: TIERS.GUEST,
        status: 'active',
        endDate: null
      })
      setLoading(false)
      return
    }

    // Load subscription data for authenticated users
    const loadSubscription = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if user exists in profiles table
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          throw profileCheckError
        }

        // Create profile with default subscription if it doesn't exist
        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              subscription_tier: TIERS.FREE,
              subscription_status: 'active',
              subscription_end_date: null
            })

          if (insertError) throw insertError
        }

        // Get the subscription data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, subscription_end_date')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          if (profileError.code === '42703') {
            setSubscription({
              tier: TIERS.FREE,
              status: 'active',
              endDate: null
            })
            return
          }
          throw profileError
        }

        setSubscription({
          tier: profile.subscription_tier,
          status: profile.subscription_status,
          endDate: profile.subscription_end_date
        })
      } catch (err) {
        console.error('Error in subscription setup:', err)
        setError(err.message)
        // Set default values if there's an error
        setSubscription({
          tier: TIERS.FREE,
          status: 'active',
          endDate: null
        })
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [session])

  // Get daily message count for authenticated users
  const getDailyMessageCount = async (userId, characterId) => {
    if (!userId || !characterId) {
      return 0;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('message_counts')
        .select('count')
        .eq('user_id', userId)
        .eq('character_id', characterId)
        .eq('date', todayStr)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return 0;
        }
        return 0;
      }

      return data?.count || 0;
    } catch (err) {
      return 0;
    }
  };

  // Check if user can send a message
  const canSendMessage = async (characterId) => {
    const tier = subscription?.tier || TIERS.GUEST;
    const limit = MESSAGE_LIMITS[tier];

    // For guest users, check session count
    if (tier === TIERS.GUEST) {
      return guestMessageCount < limit;
    }

    // For authenticated users, check daily limit
    if (tier === TIERS.FREE && session?.user?.id) {
      const dailyCount = await getDailyMessageCount(session.user.id, characterId);
      return dailyCount < limit;
    }

    // Premium users have no limit
    return true;
  };

  // Increment message count
  const incrementMessageCount = async (userId, characterId) => {
    if (!userId || !characterId) {
      return false;
    }

    try {
      const currentCount = await getDailyMessageCount(userId, characterId);
      const newCount = currentCount + 1;
      
      const result = await saveChat(userId, characterId, newCount);
      return result !== null;
    } catch (err) {
      return false;
    }
  };

  // Get remaining messages
  const getRemainingMessages = async (characterId) => {
    const tier = subscription?.tier || TIERS.GUEST;
    const limit = MESSAGE_LIMITS[tier];

    // For guest users, check session count
    if (tier === TIERS.GUEST) {
      return Math.max(0, limit - guestMessageCount);
    }

    // For authenticated users on free tier, check daily limit
    if (tier === TIERS.FREE && session?.user?.id) {
      const dailyCount = await getDailyMessageCount(session.user.id, characterId);
      return Math.max(0, limit - dailyCount);
    }

    // Premium users have unlimited messages
    return Infinity;
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      error,
      canSendMessage,
      incrementMessageCount,
      getRemainingMessages,
      MESSAGE_LIMITS
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
