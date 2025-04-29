// components/sidebar/CharacterList.jsx

'use client';

import { useCharacter } from '@/contexts/CharacterContext'
import { Loader2, UserRound } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useSubscription } from '@/contexts/SubscriptionContext'
import NotificationsPanel from './NotificationsPanel'
import { useEffect } from 'react'

export default function CharacterList() {
  const { 
    selectedCharacter, 
    setSelectedCharacter,
    showNotifications,
    setShowNotifications,
    unreadMessages,
    hasUnreadMessages,
    isLoading,
    error,
    characterMessages,
    characters
  } = useCharacter()
  const { tier, getRemainingMessages } = useSubscription()
  const pathname = usePathname()
  const router = useRouter()

  // Debug log for unread state
  useEffect(() => {
    console.log('CharacterList unread state:', {
      unreadMessages,
      characterMessages,
      selectedCharacter: selectedCharacter?.id,
      hasUnread: hasUnreadMessages(),
      unreadCounts: Object.entries(unreadMessages).reduce((acc, [id, isUnread]) => {
        if (isUnread) acc[id] = true;
        return acc;
      }, {})
    });
  }, [unreadMessages, characterMessages, selectedCharacter, hasUnreadMessages]);

  // Clear selected character when not on chat page
  useEffect(() => {
    if (pathname !== '/') {
      setSelectedCharacter(null)
    }
  }, [pathname, setSelectedCharacter])

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character)
    setShowNotifications(false)
    
    // If not on chat page, navigate to it
    if (pathname !== '/') {
      router.push('/')
    }
  }

  // If notifications are being shown, render the notifications panel
  if (showNotifications) {
    return <NotificationsPanel />
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Characters</h2>
      </div>

      {/* Guest User Message */}
      {tier === "guest" && (
        <div className="pt-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg m-4">
          <p className="text-sm">
            You have {getRemainingMessages()} messages remaining today.
          </p>
        </div>
      )}
      
      {/* Character List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">
            {error}
          </div>
        ) : !characters || characters.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No characters available
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {characters.map((character) => {
              const isSelected = selectedCharacter?.id === character.id;
              const hasUnread = unreadMessages[character.id] === true;
              const latestMessage = characterMessages[character.id];
              const messageText = latestMessage ? latestMessage.content : character.description;
              
              return (
                <div
                  key={character.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/15 border-l-4 border-primary shadow-sm'
                      : hasUnread
                      ? 'bg-white dark:bg-neutral-900 border-l-4 border-cyan-500 shadow-md'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  onClick={() => handleCharacterClick(character)}
                >
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
                    isSelected 
                      ? 'bg-primary/20 ring-2 ring-primary/70' 
                      : hasUnread 
                      ? 'bg-cyan-500/20 ring-2 ring-cyan-500/70' 
                      : 'bg-neutral-200 dark:bg-neutral-700'
                  }`}>
                    <UserRound className={`w-6 h-6 ${
                      isSelected 
                        ? 'text-primary' 
                        : hasUnread 
                        ? 'text-cyan-500' 
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`} />
                    {hasUnread && !isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">•</span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${
                      isSelected 
                        ? 'text-primary' 
                        : hasUnread && !isSelected 
                        ? 'text-cyan-500 dark:text-cyan-400' 
                        : ''
                    }`}>
                      {character.name}
                    </h3>
                    <p className={`text-xs truncate mt-1 ${
                      isSelected 
                        ? 'text-primary/80 font-medium' 
                        : hasUnread && !isSelected 
                        ? 'text-cyan-600 dark:text-cyan-300 font-medium' 
                        : 'text-muted-foreground'
                    }`}>
                      {messageText}
                    </p>
                  </div>
                  {hasUnread && !isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}