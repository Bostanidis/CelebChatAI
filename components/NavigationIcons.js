"use client"

import { Moon, Sun, Monitor, UserRound, Settings, User, CreditCard, MessageCircle, Bell, X } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(false)
  const [themeModalOpen, setThemeModalOpen] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const menuRef = useRef(null)
  const modalRef = useRef(null)
  const pathname = usePathname()
  const { setShowNotifications, hasUnreadMessages } = useCharacter()
  const { user } = useAuth()
  const [userID, setUserID] = useState(null)

  useEffect(() => {
    setMounted(true)
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
        setUserMenuOpen(false)
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setThemeModalOpen(false)
        setUserModalOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close menus or modals when window is resized between breakpoints
  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768
      if (currentIsMobile !== isMobile) {
        setIsOpen(false)
        setUserMenuOpen(false)
        setThemeModalOpen(false)
        setUserModalOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

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
  }, [pathname])

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen)
    setShowNotifications(!notificationsOpen)
    // Close other menus and modals
    setIsOpen(false)
    setUserMenuOpen(false)
    setThemeModalOpen(false)
    setUserModalOpen(false)
  }

  const handleMessageClick = () => {
    // Close notifications if open
    if (notificationsOpen) {
      setNotificationsOpen(false)
      setShowNotifications(false)
    }
    setIsInChatView(true)
  }

  const handleThemeToggleClick = () => {
    if (isMobile) {
      setThemeModalOpen(!themeModalOpen)
      // Close other menus and modals
      setUserModalOpen(false)
    } else {
      setIsOpen(!isOpen)
      // Close user menu if it's open
      setUserMenuOpen(false)
    }
    
    if (notificationsOpen) {
      setNotificationsOpen(false)
      setShowNotifications(false)
    }
  }

  const handleUserMenuClick = () => {
    if (isMobile) {
      setUserModalOpen(!userModalOpen)
      // Close other menus and modals
      setThemeModalOpen(false)
    } else {
      setUserMenuOpen(!userMenuOpen)
      // Close theme menu if it's open
      setIsOpen(false)
    }
    
    if (notificationsOpen) {
      setNotificationsOpen(false)
      setShowNotifications(false)
    }
  }

  const closeModal = () => {
    setThemeModalOpen(false)
    setUserModalOpen(false)
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

  // Animation variants for desktop menus
  const menuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: -5,
      transition: { 
        duration: 0.15,
        ease: [0.32, 0.72, 0, 1]
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

  // Animation variants for mobile modal
  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  // Animation variants for overlay
  const overlayVariants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
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
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" />
          {hasUnreadMessages() && (
            <span 
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" 
              aria-label="Unread notifications"
            />
          )}
        </button>
      </div>

      <div className="relative">
        <button
          onClick={handleUserMenuClick}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            userMenuOpen || userModalOpen
              ? 'text-primary' 
              : 'text-neutral-600 dark:text-neutral-200 hover:text-primary dark:hover:text-primary'
          }`}
          aria-label="User menu"
        >
          <UserRound className="h-6 w-6" />
        </button>

        {/* Desktop user dropdown menu */}
        <AnimatePresence>
          {!isMobile && userMenuOpen && (
            <motion.div
              className="absolute right-0 mt-2 w-48 rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm shadow-lg border border-neutral-200/50 dark:border-neutral-800/50 py-1.5 z-[100] overflow-hidden"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {userOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.label}>
                    <Link
                      href={option.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-center w-5 h-5 text-primary">
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

        {/* Mobile user modal */}
        <AnimatePresence>
          {isMobile && userModalOpen && (
            <>
              <motion.div 
                className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[999]"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={closeModal}
              />
              <motion.div 
                className="fixed inset-x-4 bg-white dark:bg-neutral-900 rounded-xl shadow-xl z-[1000] overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                ref={modalRef}
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Account Options</h3>
                  <button 
                    onClick={closeModal}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </button>
                </div>
                <div className="px-1 py-2">
                  {userOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <Link
                        key={option.label}
                        href={option.href}
                        onClick={closeModal}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-lg"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        {option.label}
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <button
          onClick={handleThemeToggleClick}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            isOpen || themeModalOpen
              ? 'text-primary' 
              : 'text-neutral-600 dark:text-neutral-200 hover:text-primary dark:hover:text-primary'
          }`}
          aria-label="Theme settings"
        >
          {getThemeIcon()}
        </button>

        {/* Desktop theme dropdown menu */}
        <AnimatePresence>
          {!isMobile && isOpen && (
            <motion.div
              className="absolute right-0 mt-2 w-48 rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm shadow-lg border border-neutral-200/50 dark:border-neutral-800/50 py-1.5 z-[100] overflow-hidden"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {options.map((option) => {
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
                        w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                        transition-colors duration-200 
                        ${theme === option.value 
                          ? 'text-primary bg-primary/5' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'}
                      `}
                    >
                      <div className="flex items-center justify-center w-5 h-5 text-primary">
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

        {/* Mobile theme modal */}
        <AnimatePresence>
          {isMobile && themeModalOpen && (
            <>
              <motion.div 
                className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[999]"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={closeModal}
              />
              <motion.div 
                className="fixed inset-x-4 bg-white dark:bg-neutral-900 rounded-xl shadow-xl z-[1000] overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                ref={modalRef}
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Appearance</h3>
                  <button 
                    onClick={closeModal}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </button>
                </div>
                <div className="px-1 py-2">
                  {options.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        onClick={async () => {
                          setTheme(option.value)
                          closeModal()
                          
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
                          w-full flex items-center gap-3 px-4 py-3 text-base font-medium
                          transition-colors duration-200 rounded-lg
                          ${theme === option.value 
                            ? 'text-primary bg-primary/5' 
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'}
                        `}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}