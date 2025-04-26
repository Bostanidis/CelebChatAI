'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import supabase from '@/utils/supabase/client';
import { getAllCharacters } from '@/lib/characters';

const CharacterContext = createContext();

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
  const [lastReadTimes, setLastReadTimes] = useState({});

  const { subscription } = useSubscription();
  const { user } = useAuth();

  const fetchCharacters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get local characters
      const localCharacters = getAllCharacters();
      
      // Fetch characters from Supabase
      const { data: dbCharacters, error } = await supabase
        .from('characters')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching characters:', error);
        // Fall back to local characters if Supabase fails
        setCharacters(localCharacters);
        return;
      }

      // Create a map of DB characters for quick lookup
      const dbCharacterMap = new Map(dbCharacters?.map(char => [char.id, char]) || []);
      
      // Combine characters, preferring DB versions when available
      const combinedCharacters = localCharacters.map(localChar => {
        const dbChar = dbCharacterMap.get(localChar.id);
        return dbChar ? { ...localChar, ...dbChar } : localChar;
      });

      setCharacters(combinedCharacters);
      console.log('Successfully fetched characters:', combinedCharacters?.length);
    } catch (err) {
      console.error('Unexpected error fetching characters:', err);
      
      // Fall back to local characters on error
      const localCharacters = getAllCharacters();
      setCharacters(localCharacters);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCharacters();
    } else {
      setIsLoading(false);
    }
  }, [fetchCharacters, user]);

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
    
    const lastReadTimeStr = lastReadTimes[characterId];
    const lastReadTime = lastReadTimeStr ? new Date(lastReadTimeStr).getTime() : 0;
    const isFromSelectedCharacter = selectedCharacter?.id === characterId;
    
    console.log('Message update:', {
      characterId,
      messageTime,
      lastReadTime,
      timeDiff: messageTime - lastReadTime,
      isFromSelectedCharacter,
      isUser: message.isUser,
      isSystem: message.isSystem
    });

    setCharacterMessages(prev => ({
      ...prev,
      [characterId]: {
        ...message,
        isUnread: !message.isUser && !message.isSystem && 
          (!isFromSelectedCharacter || messageTime - lastReadTime > 5000)
      }
    }));

    if (!message.isUser && !message.isSystem) {
      if (!isFromSelectedCharacter || messageTime - lastReadTime > 5000) {
        console.log('Marking message as unread for character:', characterId);
        setUnreadMessages(prev => ({
          ...prev,
          [characterId]: true
        }));
      }
    }
  }, [lastReadTimes, selectedCharacter]);

  const handleSetSelectedCharacter = useCallback((character) => {
    if (!character) {
      console.warn('Attempted to select invalid character');
      return;
    }

    console.log('Setting selected character:', character.id);
    setSelectedCharacter(character);
    
    // Update last read time for this character
    const now = Date.now();
    setLastReadTimes(prev => ({
      ...prev,
      [character.id]: new Date(now).toISOString()
    }));
    
    // Mark messages as read for this character
    setUnreadMessages(prev => ({
      ...prev,
      [character.id]: false
    }));
  }, []);

  const markAllMessagesAsRead = useCallback(() => {
    if (!Object.keys(characterMessages).length) {
      return;
    }

    const currentTime = Date.now();
    const newLastReadTimes = {};
    const newUnreadMessages = {};

    Object.entries(characterMessages).forEach(([characterId, message]) => {
      if (!characterId || !message) {
        return;
      }

      newLastReadTimes[characterId] = currentTime;
      newUnreadMessages[characterId] = false;
    });

    if (Object.keys(newLastReadTimes).length === 0) {
      return;
    }

    setLastReadTimes(newLastReadTimes);
    setUnreadMessages(newUnreadMessages);
  }, [characterMessages]);

  const hasUnreadMessages = useCallback(() => {
    if (!Object.keys(unreadMessages).length) {
      return false;
    }

    const selectedCharId = selectedCharacter?.id;
    const unreadStatus = Object.entries(unreadMessages).some(([characterId, isUnread]) => {
      if (!isUnread || characterId === selectedCharId) {
        return false;
      }

      const message = characterMessages[characterId];
      if (!message) {
        return false;
      }
      
      return true;
    });
    
    console.log('Unread status check:', {
      unreadMessages,
      selectedCharId,
      hasUnread: unreadStatus
    });
    
    return unreadStatus;
  }, [unreadMessages, characterMessages, selectedCharacter]);

  // Replace the notification effect with a debounced version
  useEffect(() => {
    const updateNotifications = debounce(() => {
      const hasUnread = hasUnreadMessages();

      
    }, 300);

    updateNotifications();

    return () => {
      updateNotifications.clear && updateNotifications.clear();
    };
  }, [unreadMessages, hasUnreadMessages, showNotifications]);

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