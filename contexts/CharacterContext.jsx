'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import { getAllCharacters, CHARACTERS } from '@/lib/characters';

const CharacterContext = createContext();

// Add debug log
console.log('CharacterContext initialization, CHARACTERS:', Object.keys(CHARACTERS).length);

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export function CharacterProvider({ children }) {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [characterMessages, setCharacterMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});

  const { subscription } = useSubscription();
  const { user } = useAuth();

  // Debug function to log state changes
  const logStateChange = useCallback((action, data) => {
    // Only log if it's a significant state change
    const shouldLog = [
      'Selecting Character',
      'Deselecting Character',
      'Message Update',
      'Updating Notifications'
    ].includes(action);

    if (shouldLog) {
      console.log(`[CharacterContext] ${action}:`, {
        selectedCharacter: selectedCharacter?.id,
        unreadMessages,
        characterMessages,
        ...data
      });
    }
  }, [selectedCharacter, unreadMessages, characterMessages]);

  // Remove Supabase fetching logic
  // Fetch characters from local characters.js file
  const fetchCharacters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      // Get characters from local characters.js file
      const localCharacters = getAllCharacters();
      console.log('Local characters loaded:', localCharacters?.length, localCharacters);
  
      // Set characters directly from local source
      setCharacters(localCharacters);
    } catch (err) {
      console.error('Unexpected error fetching characters:', err);
      setError('Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('CharacterContext useEffect running, user:', !!user);
    fetchCharacters();
  }, [fetchCharacters, user]);

  const handleSetSelectedCharacter = useCallback((character) => {
    // Allow null to deselect character
    if (character === null) {
      logStateChange('Deselecting Character', {});
      setSelectedCharacter(null);
      return;
    }

    logStateChange('Selecting Character', { characterId: character.id });
    
    // First update selected character
    setSelectedCharacter(character);
    
    // Then update message states in a single batch
    setCharacterMessages(prev => {
      const newState = {
        ...prev,
        [character.id]: prev[character.id] ? {
          ...prev[character.id],
          isUnread: false
        } : prev[character.id]
      };
      return newState;
    });

    setUnreadMessages(prev => {
      const newState = {
        ...prev,
        [character.id]: false
      };
      return newState;
    });
  }, [logStateChange]);

  const updateCharacterMessage = useCallback((characterId, message) => {
    if (!characterId || !message) {
      console.warn('Invalid characterId or message in updateCharacterMessage');
      return;
    }

    let messageTime;
    try {
      messageTime = message.timestamp ? new Date(message.timestamp).getTime() : Date.now();
      if (isNaN(messageTime)) {
        throw new Error('Invalid timestamp');
      }
    } catch (err) {
      messageTime = Date.now();
      console.warn('Invalid timestamp, using current time');
    }
    
    // Get the current selectedCharacter directly from state to avoid stale closures
    setSelectedCharacter(currentSelected => {
      const isFromSelectedCharacter = currentSelected?.id === characterId;
      
      // Only mark as unread if it's not from the user, not a system message, and not from the currently selected character
      const isUnread = !message.isUser && !message.isSystem && !isFromSelectedCharacter;

      logStateChange('Message Update', {
        characterId,
        messageTime,
        isFromSelectedCharacter,
        isUser: message.isUser,
        isSystem: message.isSystem,
        isUnread,
        currentMessage: characterMessages[characterId],
        currentSelectedCharacter: currentSelected?.id
      });

      // Update both states in a single batch
      setCharacterMessages(prev => {
        const newState = {
          ...prev,
          [characterId]: {
            ...message,
            isUnread
          }
        };
        return newState;
      });

      setUnreadMessages(prev => {
        const newState = {
          ...prev,
          [characterId]: isUnread
        };
        return newState;
      });

      // Return the current selectedCharacter (no change to this state)
      return currentSelected;
    });
  }, [characterMessages, logStateChange]);

  const markAllMessagesAsRead = useCallback(() => {
    if (!Object.keys(characterMessages).length) {
      return;
    }

    logStateChange('Marking All Messages as Read', {});

    // Update both states to mark all messages as read
    const newUnreadMessages = {};
    const newCharacterMessages = { ...characterMessages };

    Object.keys(characterMessages).forEach(characterId => {
      newUnreadMessages[characterId] = false;
      if (newCharacterMessages[characterId]) {
        newCharacterMessages[characterId] = {
          ...newCharacterMessages[characterId],
          isUnread: false
        };
      }
    });

    setUnreadMessages(newUnreadMessages);
    setCharacterMessages(newCharacterMessages);
  }, [characterMessages, logStateChange]);

  const hasUnreadMessages = useCallback(() => {
    if (!Object.keys(unreadMessages).length) {
      return false;
    }

    const selectedCharId = selectedCharacter?.id;
    
    // Check both states for consistency
    return Object.keys(unreadMessages).some(characterId => {
      if (characterId === selectedCharId) return false;
      return unreadMessages[characterId] === true;
    });
  }, [unreadMessages, selectedCharacter]);

  // Complete the notification effect - only update hasUnreadMessages state, never control panel visibility
  useEffect(() => {
    const updateNotifications = debounce(() => {
      const hasUnread = hasUnreadMessages();
      logStateChange('Updating Notifications', { hasUnread });
      
      // Remove all auto-open/auto-close functionality
      // Panel visibility is now exclusively controlled by the Bell icon
      
    }, 300);

    updateNotifications();

    return () => {
      updateNotifications.clear && updateNotifications.clear();
    };
  }, [unreadMessages, hasUnreadMessages, logStateChange]);

  const value = {
    characters,
    selectedCharacter,
    setSelectedCharacter: handleSetSelectedCharacter,
    isLoading,
    error,
    canAccessCharacter: useCallback((character) => !!character, []),
    refreshCharacters: fetchCharacters,
    showNotifications,
    setShowNotifications,
    characterMessages,
    updateCharacterMessage,
    unreadMessages,
    hasUnreadMessages,
    markAllMessagesAsRead
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}