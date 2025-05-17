// components/chat/ChatWindow.jsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@/contexts/ChatContext.jsx'
import { useSubscription } from '@/contexts/SubscriptionContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCharacter } from '@/contexts/CharacterContext'
import { ArrowLeft, UserRound, MoreVertical, Trash2, Ban, UserPlus } from 'lucide-react'
import Logo from '../Logo'

// Placeholder component for when no character is selected
function WelcomePlaceholder() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-auto">
        <div className="h-full flex items-center justify-center">
          <Logo />
        </div>
      </div>
    </div>
  )
}

// Placeholder component for when a character is selected but no messages exist
function StartChattingPlaceholder({ characterName }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 max-w-md mx-auto glass border border-neutral-300/30 dark:border-neutral-700/50 rounded-2xl animate-scaleIn shadow-xl dark:shadow-lg dark:shadow-purple-900/20 backdrop-blur-md">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-md opacity-60 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full h-full w-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM15.375 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 gradient-text">Start chatting with {characterName}</h2>
        <p className="text-neutral-600 dark:text-neutral-300">Say hello or ask anything to get the conversation started!</p>
      </div>
    </div>
  )
}

export default function ChatWindow() {
  const { user } = useAuth();
  const { selectedCharacter, characters, isLoading: isLoadingCharacters, error: characterError, setSelectedCharacter } = useCharacter();
  const { messages, sendMessage, isLoading, deleteChatMessages } = useChat();
  const { subscription, getRemainingMessages, MESSAGE_LIMITS, guestMessageCount } = useSubscription();
  const [input, setInput] = useState('')
  const [remainingMessages, setRemainingMessages] = useState(null)
  const messagesEndRef = useRef(null)
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const typingTimerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBlockUser = useCallback(() => {
    setIsBlocked(true)
    setIsMenuOpen(false)
  }, [])

  const handleUnblockUser = useCallback(() => {
    setIsBlocked(false)
  }, [])

  const handleDeleteChat = useCallback(async () => {
    if (!selectedCharacter) return
    
    try {
      const success = await deleteChatMessages(selectedCharacter.id)
      if (success) {
        // Chat deleted successfully
        console.log('Chat deleted successfully')
      } else {
        console.error('Failed to delete chat')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
    
    setIsMenuOpen(false)
  }, [selectedCharacter, deleteChatMessages])

  // Update remaining messages count
  useEffect(() => {
    const updateRemainingMessages = async () => {
      const remaining = await getRemainingMessages()
      setRemainingMessages(remaining)
      
      // Show signup modal if guest user has used all messages
      if (!user && remaining === 0) {
        setShowSignUpModal(true)
      }
    }
    updateRemainingMessages()
  }, [messages, getRemainingMessages, user])

  // Sign Up Modal Component
  const SignUpModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">
            Sign Up to Continue
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            You've reached the guest message limit. Create an account to continue chatting and get more messages per day!
          </p>
          <button
            onClick={() => router.push(`/signup?redirectTo=${encodeURIComponent(window.location.pathname)}`)}
            className="btn btn-primary w-full gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Sign Up Now
          </button>
        </div>
      </div>
    </div>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || !selectedCharacter) return

    const remaining = await getRemainingMessages()
    
    // If user has no remaining messages
    if (remaining <= 0) {
      if (!user) {
        // For guest users, show signup modal
        setShowSignUpModal(true)
      } else {
        // For free tier users, show upgrade modal
        router.push('/upgrade')
      }
      return
    }

    const messageContent = input.trim()
    setInput('')

    try {
      // Clear any existing typing indicator timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      
      // Set typing indicator
      const randomDelay = Math.floor(Math.random() * 2000) + 1000
      typingTimerRef.current = setTimeout(() => {
        setShowTypingIndicator(true)
      }, randomDelay)
      
      await sendMessage(messageContent)
      
      // Update remaining messages after sending
      const newRemaining = await getRemainingMessages()
      setRemainingMessages(newRemaining)

      // Show signup modal if this was the last guest message
      if (!user && newRemaining === 0) {
        setShowSignUpModal(true)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setShowTypingIndicator(false)
      // Don't set input back if error occurs, let the error message show in the chat
    }
  }

  // Clear typing indicator when messages change or on error
  useEffect(() => {
    if ((messages && messages.length > 0) || messages?.some(m => m.role === 'error')) {
      setShowTypingIndicator(false);
    }
  }, [messages]);

  if (!selectedCharacter) {
    return <WelcomePlaceholder />;
  }

  if (isBlocked) {
  return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3 overflow-hidden object-fit">
            <button
              onClick={() => setSelectedCharacter(null)}
              className="btn btn-ghost btn-sm"
            >
              ←
            </button>
            {selectedCharacter?.avatar_url ? (
              <img
                src={selectedCharacter.avatar_url}
                alt={selectedCharacter.name}
                className="w-8 h-8 rounded-full object-cover object-top"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content">
                {selectedCharacter?.name?.[0] || '?'}
              </div>
            )}
            <span className="font-medium">{selectedCharacter?.name || 'Select a character'}</span>
          </div>
              </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
              <Ban className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-xl font-semibold mb-2">User Blocked</h3>
            <p className="text-muted-foreground mb-6">
              You have blocked {selectedCharacter.name}. You will not receive any more messages from this character.
            </p>
            <button
              onClick={handleUnblockUser}
              className="btn btn-primary"
            >
              Unblock User
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Modal Component
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-200">
          Continue Chatting
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          You've reached the guest message limit. Sign in or create an account to continue chatting and get more messages per day!
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push(`/signup?redirectTo=${encodeURIComponent(window.location.pathname)}`)}
            className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 overflow-hidden object-fit">
          <button
            onClick={() => setSelectedCharacter(null)}
            className="btn btn-ghost btn-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {selectedCharacter?.avatar_url ? (
            <img
              src={selectedCharacter.avatar_url}
              alt={selectedCharacter.name}
              className="w-8 h-8 rounded-full object-cover object-top"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content">
              {selectedCharacter?.name?.[0] || '?'}
        </div>
      )}
          <span className="font-medium text-neutral-800 dark:text-neutral-200">{selectedCharacter?.name || 'Select a character'}</span>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="btn btn-ghost btn-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={handleBlockUser}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 cursor-pointer"
                  role="menuitem"
                >
                  <Ban className="w-4 h-4" />
                  Block User
                </button>
                <button
                  onClick={handleDeleteChat}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 cursor-pointer"
                  role="menuitem"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <img
                src={selectedCharacter.avatar_url}
                alt={selectedCharacter.name}
                className="w-24 h-24 mx-auto mb-4 rounded-full object-cover object-top"
              />
              <h2 className="text-2xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">
                Chat with {selectedCharacter.name}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {selectedCharacter.description}
              </p>
            </div>
          </div>
        ) : (
          <>
        {messages.map((message, index) => (
          <MessageBubble
                key={index} 
            message={message}
                character={selectedCharacter}
          />
        ))}
            {showTypingIndicator && !messages.some(m => m.role === 'error') && (
              <div className="flex w-full mb-4 justify-start">
                <div className="flex max-w-[80%] items-start gap-3 flex-row">
                  {selectedCharacter?.avatar_url && (
                    <div className="flex-shrink-0 w-10 h-10 relative">
                      <img
                        src={selectedCharacter.avatar_url}
                        alt={selectedCharacter.name}
                        className="w-full h-full object-cover rounded-full object-top"
                      />
                    </div>
                  )}
                  <TypingIndicator />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-neutral-200/50 dark:border-neutral-800/50 p-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              remainingMessages <= 0
                ? user
                  ? "Upgrade to send more messages"
                  : "Sign up to send more messages"
                : "Type your message..."
            }
            className="flex-1 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isLoading || remainingMessages <= 0}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || remainingMessages <= 0}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>

      {/* Login Modal */}
      {showLoginModal && <LoginModal />}

      {/* Sign Up Modal */}
      {showSignUpModal && <SignUpModal />}
    </div>
  )
}