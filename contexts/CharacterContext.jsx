'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import supabase from '@/utils/supabase/client';
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
  const [lastReadTimes, setLastReadTimes] = useState({});

  const { subscription } = useSubscription();
  const { user } = useAuth();

  const fetchCharacters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always get local characters first
      const localCharacters = getAllCharacters();
      console.log('Local characters loaded:', localCharacters?.length, localCharacters);
      
      // If user is not authenticated, just use local characters
      if (!user) {
        console.log('No user, setting local characters');
        setCharacters(localCharacters);
        return;
      }

      // Optionally fetch additional data from Supabase if user is authenticated
      try {
        console.log('Fetching from Supabase...');
        const { data: dbCharacters, error } = await supabase
          .from('characters')
          .select('*')
          .order('name');

        console.log('Supabase response:', { dbCharacters, error });

        if (!error && dbCharacters) {
          // Create a map of DB characters for quick lookup
          const dbCharacterMap = new Map(dbCharacters.map(char => [char.id, char]));
          
          // Combine characters, preferring DB versions when available
          const combinedCharacters = localCharacters.map(localChar => {
            const dbChar = dbCharacterMap.get(localChar.id);
            return dbChar ? { ...localChar, ...dbChar } : localChar;
          });

          console.log('Setting combined characters:', combinedCharacters?.length);
          setCharacters(combinedCharacters);
        } else {
          // If Supabase fails, just use local characters
          console.log('Supabase error, falling back to local characters');
          setCharacters(localCharacters);
        }
      } catch (err) {
        console.error('Error fetching from Supabase:', err);
        // Fall back to local characters
        console.log('Supabase error, falling back to local characters');
        setCharacters(localCharacters);
      }
    } catch (err) {
      console.error('Unexpected error fetching characters:', err);
      setError('Failed to load characters');
      
      // Try to fall back to local characters
      try {
        const localCharacters = getAllCharacters();
        console.log('Error recovery: setting local characters');
        setCharacters(localCharacters);
      } catch (e) {
        console.error('Failed to load local characters:', e);
        setError('Failed to load any characters');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('CharacterContext useEffect running, user:', !!user);
    fetchCharacters();
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
    // Allow null to deselect character
    if (character === null) {
      console.log('Deselecting character');
      setSelectedCharacter(null);
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