'use client';

import { useCharacter } from '@/contexts/CharacterContext';
import { Bell, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPanel() {
  const { 
    characterMessages, 
    characters, 
    setShowNotifications, 
    markAllMessagesAsRead,
    setSelectedCharacter // Correctly destructure the function provided by the context
  } = useCharacter();

  // Get all messages with timestamps
  const messages = Object.entries(characterMessages)
    .filter(([_, message]) => message !== undefined && message !== null && message.isUnread)
    .map(([characterId, message]) => {
      const character = characters.find(c => c.id === characterId);
      return {
        characterId,
        characterName: character?.name || 'Unknown Character',
        characterImage: character?.avatar_url || null,
        ...(message || {}),
        timestamp: message && message.timestamp ? new Date(message.timestamp) : new Date()
      };
    })
    .filter(message => message.timestamp && !isNaN(message.timestamp.getTime()))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleClose = () => {
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    markAllMessagesAsRead();
  };

  const handleNotificationClick = (characterId) => {
    const character = characters.find(c => c.id === characterId);
    if (character) {
      setSelectedCharacter(character); // Use the correctly destructured function
    }
    setShowNotifications(false);
  };

  // Enhance the design with modern look
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/20 dark:border-neutral-200/10">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-md font-semibold tracking-tight">Notifications</h3>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Mark all <br></br> read
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8 space-y-2">
            <Bell className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
            <p>No new notifications</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {messages.map((message, index) => (
              <button 
                key={`${message.characterId}-${message.timestamp}`}
                onClick={() => handleNotificationClick(message.characterId)}
                className="w-full text-left p-3 rounded-xl bg-white/90 dark:bg-neutral-900 shadow-sm border border-neutral-200/30 dark:border-neutral-700/30 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors flex items-center gap-3"
              >
                {message.characterImage ? (
                  <img
                    src={message.characterImage}
                    alt={message.characterName}
                    className="w-10 h-10 rounded-full object-cover border border-primary/40 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-base text-neutral-900 dark:text-neutral-100 truncate">{message.characterName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-snug">
                    {message.content}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}