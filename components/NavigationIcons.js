"use client"

import { Moon, Sun, Monitor, UserRound, Settings, User, CreditCard, MessageCircle, Bell } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useCharacter } from '@/contexts/CharacterContext'

export function NavigationIcons() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isInChatView, setIsInChatView] = useState(true)
  const menuRef = useRef(null)
  const { setShowNotifications, hasUnreadMessages } = useCharacter()

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
    { label: 'Profile', href: '/profile', icon: User },
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

  // Animation variants
  const menuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: -5,
      transition: { 
        duration: 0.15,
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2
      }
    })
  }

  // Button hover animations
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }

  return (
    <div className="flex items-center gap-2" ref={menuRef}>
      <div className="relative">
        <Link href="/" onClick={handleMessageClick}>
          <motion.button
            className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
              isInChatView && !notificationsOpen ? 'text-primary bg-neutral-100 dark:bg-neutral-800' : ''
            }`}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
          >
            <MessageCircle className="h-5 w-5" />
          </motion.button>
        </Link>
      </div>

      <div className="relative">
        <motion.button
          onClick={handleNotificationsClick}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
            notificationsOpen ? 'text-primary bg-neutral-100 dark:bg-neutral-800' : ''
          }`}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
        >
          <Bell className="h-5 w-5" />
          {hasUnreadMessages() && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </motion.button>
      </div>

      <div className="relative">
        <motion.button
          onClick={handleUserMenuClick}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
        >
          <UserRound className="h-5 w-5" />
        </motion.button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              className="absolute left-0 mt-2 w-48 rounded-lg bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800 py-1 z-50 overflow-hidden"
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
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
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
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
              className="absolute left-0 mt-2 w-48 rounded-lg bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800 py-1 z-50 overflow-hidden"
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
                      onClick={() => {
                        setTheme(option.value)
                        setIsOpen(false)
                      }}
                      className={`
                        w-full flex items-center gap-2 px-4 py-2 text-sm
                        hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 cursor-pointer
                        ${theme === option.value ? 'text-primary' : 'text-neutral-700 dark:text-neutral-300'}
                      `}
                    >
                      <Icon className="h-4 w-4" />
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