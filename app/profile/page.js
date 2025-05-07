"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Loader2, CircleUserRound } from 'lucide-react'
import supabase from "@/utils/supabase/client"


function ProfileContent() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [profile, setProfile] = useState({ username: '', profilePicture: ''});

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfile({
          username: data.username || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to fetch user profile.' });
      } finally {
        setLoading(false);
      }
    };
    
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
    <div className="flex px-6 py-8">

      <div className='flex-1 flex gap-4 items-center bg-neutral'>
        <CircleUserRound size={48}/>
        <div className='flex-1 flex-col justify-center items-start'>
          <h1 className='text-xl text-primary'>{profile.username}</h1>
          <h3 className=''>0 Followers</h3>
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