"use client"

import { Moon, Sun, Monitor, UserRound, Settings, User, CreditCard, MessageCircle, Bell } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useCharacter } from '@/contexts/CharacterContext'
import { useAuth } from '@/contexts/AuthContext'
import supabase from '@/utils/supabase/client'
import { usePathname } from 'next/navigation'

export function NavigationIcons() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isInChatView, setIsInChatView] = useState(true)
  const menuRef = useRef(null)
  const pathname = usePathname()
  const { setShowNotifications, hasUnreadMessages } = useCharacter()
  const { user } = useAuth()
  const [userID, setUserID] = useState(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch user data to redirect to dynamic url
  useEffect(() => {
    if (!user) return

    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserID(data.id)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [user])


  useEffect(() => {
    // Update chat view state based on URL
    setIsInChatView(window.location.pathname === '/')
  }, [])

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen)
    setShowNotifications(!notificationsOpen)
    // Close other menus
    if (isOpen) setIsOpen(false)
    if (userMenuOpen) setUserMenuOpen(false)
  }

  const handleMessageClick = () => {
    // Close notifications if open
    if (notificationsOpen) {
      setNotificationsOpen(false)
      setShowNotifications(false)
    }
    setIsInChatView(true)
  }

  if (!mounted) {
    return null
  }

  const options = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ]

  const userOptions = [
    { label: 'Profile', href: `/profile/${userID}`, icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Subscription', href: '/subscription', icon: CreditCard },
  ]

  // Determine which icon to show for system theme
  const getThemeIcon = () => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />
    } else if (theme === 'dark') {
      return <Moon className="h-6 w-6" />
    } else {
      return <Sun className="h-6 w-6" />
    }
  }

  const handleThemeToggleClick = () => {
    setIsOpen(!isOpen)
    // Close user menu if it's open
    if (userMenuOpen) setUserMenuOpen(false)
    if (notificationsOpen) setNotificationsOpen(false)
  }

  const handleUserMenuClick = () => {
    setUserMenuOpen(!userMenuOpen)
    // Close theme menu if it's open
    if (isOpen) setIsOpen(false)
    if (notificationsOpen) setNotificationsOpen(false)
  }

  // Animation variants for menus
  const menuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: -5,
      transition: { 
        duration: 0.15,
        ease: [0.32, 0.72, 0, 1] // Custom easing for more natural feel
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.25,
        ease: [0, 0.55, 0.45, 1],
        staggerChildren: 0.05
      }
    }
  }

  // Animation variants for menu items
  const itemVariants = {
    hidden: { opacity: 0, y: -8, x: -4 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        delay: i * 0.04,
        duration: 0.25,
        ease: [0, 0.55, 0.45, 1]
      }
    })
  }

  // Button hover and tap animations
  const buttonVariants = {
    idle: { 
      scale: 1, 
      boxShadow: "0 0 0 0 rgba(0,0,0,0)",
      y: 0
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 8px 15px -5px rgba(0,0,0,0.15)",
      y: -2,
      transition: { 
        duration: 0.1, 
        ease: "easeOut" 
      }
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0 2px 5px -2px rgba(0,0,0,0.1)",
      y: 1,
      transition: { 
        duration: 0.05, 
        ease: "easeInOut" 
      }
    }
  }

  return (
    <div className="flex justify-between items-center w-full" ref={menuRef}>
      <div className="relative">
        <Link href="/" onClick={handleMessageClick}>
          <button
            className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              isInChatView && !notificationsOpen && (pathname === '/')
                ? 'text-primary' 
                : 'text-neutral-600 dark:text-neutral-200 hover:text-primary dark:hover:text-primary'
            }`}
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={handleNotificationsClick}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            notificationsOpen 
              ? 'text-primary' 
              : 'text-neutral-600 dark:text-neutral-200 hover:text-primary dark:hover:text-primary'
          }`}
        >
          <Bell className="h-6 w-6" />
          {hasUnreadMessages() && (
            <span 
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" 
            />
          )}
        </button>
      </div>

      <div className="relative">
        <button
          onClick={handleUserMenuClick}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            userMenuOpen 
              ? 'text-primary' 
              : 'text-neutral-600 dark:text-neutral-200 hover:text-primary dark:hover:text-primary'
          }`}
        >
          <UserRound className="h-6 w-6" />
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              className="absolute left-0 mt-2 w-48 rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm shadow-md border border-neutral-200/50 dark:border-neutral-800/50 py-1.5 z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {userOptions.map((option, i) => {
                const Icon = option.icon
                return (
                  <div key={option.label}>
                    <Link
                      href={option.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-center w-5 h-5">
                        <Icon className="h-4 w-4" />
                      </div>
                      {option.label}
                    </Link>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <button
          onClick={handleThemeToggleClick}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            isOpen 
              ? 'text-primary' 
              : 'text-neutral-600 dark:text-neutral-200 hover:text-primary dark:hover:text-primary'
          }`}
        >
          {getThemeIcon()}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute left-0 mt-2 w-48 rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm shadow-md border border-neutral-200/50 dark:border-neutral-800/50 py-1.5 z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {options.map((option, i) => {
                const Icon = option.icon
                return (
                  <div key={option.value}>
                    <button
                      onClick={async () => {
                        setTheme(option.value)
                        setIsOpen(false)
                        
                        // Save theme preference to Supabase if user is logged in
                        if (user) {
                          try {
                            await supabase
                              .from('profiles')
                              .update({ chosen_theme: option.value })
                              .eq('id', user.id)
                          } catch (error) {
                            console.error('Error saving theme preference:', error)
                          }
                        }
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-sm font-medium
                        transition-colors duration-200
                        ${theme === option.value 
                          ? 'text-primary' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary'}
                      `}
                    >
                      <div className="flex items-center justify-center w-5 h-5">
                        <Icon className="h-4 w-4" />
                      </div>
                      {option.label}
                    </button>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}