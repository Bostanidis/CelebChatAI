"use client"

import { Moon, Sun, Monitor, UserRound, Settings, User, CreditCard, MessageCircle, Bell } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useCharacter } from '@/contexts/CharacterContext'
import { useAuth } from '@/contexts/AuthContext'
import supabase from '@/utils/supabase/client'

export function NavigationIcons() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isInChatView, setIsInChatView] = useState(true)
  const menuRef = useRef(null)
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
      return systemTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />
    } else if (theme === 'dark') {
      return <Moon className="h-5 w-5" />
    } else {
      return <Sun className="h-5 w-5" />
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
    <div className="flex items-center gap-2" ref={menuRef}>
      <div className="relative">
        <Link href="/" onClick={handleMessageClick}>
          <motion.button
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isInChatView && !notificationsOpen 
                ? 'text-primary bg-primary/10 dark:bg-primary/20 shadow-sm' 
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
            }`}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
          </motion.button>
        </Link>
      </div>

      <div className="relative">
        <motion.button
          onClick={handleNotificationsClick}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
            notificationsOpen 
              ? 'text-primary bg-primary/10 dark:bg-primary/20 shadow-sm' 
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
          }`}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
        >
          <Bell className="h-[18px] w-[18px]" />
          {hasUnreadMessages() && (
            <motion.span 
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-neutral-900" 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            />
          )}
        </motion.button>
      </div>

      <div className="relative">
        <motion.button
          onClick={handleUserMenuClick}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
            userMenuOpen 
              ? 'text-primary bg-primary/10 dark:bg-primary/20 shadow-sm' 
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
          }`}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
        >
          <UserRound className="h-[18px] w-[18px]" />
        </motion.button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              className="absolute left-0 mt-3 w-52 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm shadow-lg border border-neutral-200/50 dark:border-neutral-800/50 py-2 z-50 overflow-hidden"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {userOptions.map((option, i) => {
                const Icon = option.icon
                return (
                  <motion.div
                    key={option.label}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={option.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-6 h-6">
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      {option.label}
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <motion.button
          onClick={handleThemeToggleClick}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isOpen 
              ? 'text-primary bg-primary/10 dark:bg-primary/20 shadow-sm' 
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
          }`}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
        >
          {getThemeIcon()}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute left-0 mt-3 w-52 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm shadow-lg border border-neutral-200/50 dark:border-neutral-800/50 py-2 z-50 overflow-hidden"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {options.map((option, i) => {
                const Icon = option.icon
                return (
                  <motion.div
                    key={option.value}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
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
                        w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                        transition-all duration-200 cursor-pointer
                        ${theme === option.value 
                          ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80'}
                      `}
                    >
                      <div className="flex items-center justify-center w-6 h-6">
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      {option.label}
                    </button>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}