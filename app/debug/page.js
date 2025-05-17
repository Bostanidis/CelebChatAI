'use client'

import { useState, useEffect } from 'react'
import { debugAuthAndRLS } from '@/lib/debug-auth'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DebugPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && !session && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/login?redirectTo=/debug')
    }
  }, [loading, session, router, isRedirecting])

  const runDebug = async () => {
    setError(null)
    try {
      const debugResult = await debugAuthAndRLS()
      setResult(debugResult)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Authentication</h1>
      <button 
        onClick={runDebug}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Run Debug
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Result:</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
} 