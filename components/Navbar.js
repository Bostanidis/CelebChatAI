"use client"

import { ThemeToggle } from "./theme-toggle"
import { useState, useEffect } from "react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { tier, TIERS } = useSubscription()
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    setMenuOpen(false)
    router.push('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    if (menuOpen) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.user-menu')) {
          setMenuOpen(false)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  const handleNavigation = (path) => {
    setMenuOpen(false)
    router.push(path)
  }

  return (
    <div className="relative z-10">
      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/80 to-indigo-500/0"></div>
      
      {/* Navbar content */}
      <div className="backdrop-blur-md bg-white/90 dark:bg-neutral-900/90 px-6 py-4 shadow-lg shadow-purple-900/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="group flex items-center space-x-2">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity blur-sm group-hover:blur-md"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:from-indigo-300 group-hover:to-purple-300 transition-all">
              Character Messenger
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                <span className="loading loading-spinner loading-sm text-indigo-400"></span>
              </div>
            ) : (
              <div className="relative user-menu">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="relative group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {user ? user.email[0].toUpperCase() : '?'}
                  </div>
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {user ? (
                        <>
                          <div className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                            {user.email}
                          </div>
                          <button
                            onClick={() => handleNavigation('/profile')}
                            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            role="menuitem"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => handleNavigation('/settings')}
                            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            role="menuitem"
                          >
                            Settings
                          </button>
                          <button
                            onClick={() => handleNavigation('/subscription')}
                            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            role="menuitem"
                          >
                            Subscription
                          </button>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            role="menuitem"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleNavigation('/login')}
                            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            role="menuitem"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => handleNavigation('/signup')}
                            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            role="menuitem"
                          >
                            Sign Up
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}