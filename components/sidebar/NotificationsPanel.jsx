'use client';

import { useCharacter } from '@/contexts/CharacterContext';
import { Bell, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPanel() {
  const { 
    characterMessages, 
    characters, 
    setShowNotifications, 
    markAllMessagesAsRead 
  } = useCharacter();

  // Get all messages with timestamps
  const messages = Object.entries(characterMessages)
    .map(([characterId, message]) => {
      const character = characters.find(c => c.id === characterId);
      return {
        characterId,
        characterName: character?.name || 'Unknown Character',
        ...message
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

  const handleClose = () => {
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    markAllMessagesAsRead();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200/20 dark:border-neutral-200/10">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold tracking-tight">Notifications</h3>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Mark all read
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
              <div 
                key={`${message.characterId}-${message.timestamp}`}
                className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{message.characterName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 