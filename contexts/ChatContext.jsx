"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { streamChatResponse, getChatResponse } from '../lib/ai'
import { saveChat, getChats, deleteChat } from '../lib/supabase'
import supabase from '@/utils/supabase/client'
import { useCharacter } from './CharacterContext'
import { useSubscription } from './SubscriptionContext'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  // Instead of a single messages array, we'll use a map of character IDs to their messages
  const [chatStates, setChatStates] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [user, setUser] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true) // Initialize as true by default for all users
  const { selectedCharacter, updateCharacterMessage } = useCharacter()
  const { user: subscriptionUser, canSendMessage, incrementMessageCount } = useSubscription()
  
  // Track active requests by character ID
  const activeRequestsRef = useRef({})
  
  // Audio refs for sound effects
  const sendingSoundRef = useRef(null)
  const notificationSoundRef = useRef(null)
  
  // Initialize audio elements
  useEffect(() => {
    sendingSoundRef.current = new Audio('/sounds/sendingmessage.mp3')
    notificationSoundRef.current = new Audio('/sounds/notification.mp3')
    
    // Preload the sounds
    sendingSoundRef.current.load()
    notificationSoundRef.current.load()
    
    return () => {
      // Clean up audio elements
      if (sendingSoundRef.current) {
        sendingSoundRef.current.pause()
        sendingSoundRef.current = null
      }
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause()
        notificationSoundRef.current = null
      }
    }
  }, [])
  
  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Load sound settings when user changes
  useEffect(() => {
    const fetchSoundSettings = async () => {
      if (!user) {
        // Keep sounds enabled for non-logged in users
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('sound_enabled')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setSoundEnabled(data.sound_enabled)
      } catch (error) {
        console.error('Error fetching sound settings:', error)
        // Keep sounds enabled even on error
        setSoundEnabled(true)
      }
    }

    fetchSoundSettings()
  }, [user])

  // Load chat when character changes
  useEffect(() => {
    if (selectedCharacter && user) {
      loadChat(selectedCharacter.id)
    }
  }, [selectedCharacter, user])

  // Helper function to get current messages for a character
  const getMessagesForCharacter = useCallback((characterId) => {
    return chatStates[characterId]?.messages || []
  }, [chatStates])

  // Helper function to update messages for a specific character
  const updateMessagesForCharacter = useCallback((characterId, newMessages) => {
    setChatStates(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        messages: newMessages,
        isLoading: false
      }
    }))
  }, [])

  // Helper function to update streaming message for a specific character
  const updateStreamingMessageForCharacter = useCallback((characterId, streamingText) => {
    setChatStates(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        streamingMessage: streamingText
      }
    }))
  }, [])

  // Helper function to set loading state for a specific character
  const setLoadingForCharacter = useCallback((characterId, loading) => {
    setChatStates(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        isLoading: loading
      }
    }))
  }, [])

  // Save chat messages whenever they change
  useEffect(() => {
    const saveChatMessages = async () => {
      if (!user || !selectedCharacter) return;
      
      const characterId = selectedCharacter.id;
      const messages = chatStates[characterId]?.messages;
      
      if (!messages || messages.length === 0) return;

      try {
        await saveChat(user.id, characterId, messages);
      } catch (error) {
        console.error('Error auto-saving chat:', error);
      }
    };

    saveChatMessages();
  }, [user, selectedCharacter, chatStates]);

  const sendMessage = useCallback(async (content) => {
    if (!selectedCharacter) {
      return;
    }
    
    if (!canSendMessage()) {
      return;
    }

    const characterId = selectedCharacter.id;
    
    if (activeRequestsRef.current[characterId]) {
      return;
    }

    activeRequestsRef.current[characterId] = true;
    
    const currentMessages = getMessagesForCharacter(characterId);
    const newMessage = { role: 'user', content };
    
    // Add the user's message immediately
    const updatedMessages = [...currentMessages, newMessage];
    updateMessagesForCharacter(characterId, updatedMessages);
    
    if (soundEnabled && sendingSoundRef.current) {
      sendingSoundRef.current.currentTime = 0;
      sendingSoundRef.current.play().catch(() => {});
    }

    try {
      const responseBody = await streamChatResponse(
        updatedMessages,
        characterId
      );

      let fullResponse = '';
      const reader = responseBody.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullResponse += parsed.content;
                  updateStreamingMessageForCharacter(characterId, fullResponse);
                }
              } catch (e) {}
            }
          }
        }
      } catch (streamError) {
        throw streamError;
      }

      if (!activeRequestsRef.current[characterId]) {
        return;
      }

      const aiMessage = { role: 'assistant', content: fullResponse };
      const messagesWithResponse = [...updatedMessages, aiMessage];
      
      updateMessagesForCharacter(characterId, messagesWithResponse);
      
      updateCharacterMessage(characterId, {
        content: fullResponse,
        timestamp: Date.now(),
        isUser: false,
        isUnread: true
      });
      
      // Only play notification sound if sound is enabled
      if (soundEnabled && notificationSoundRef.current) {
        notificationSoundRef.current.currentTime = 0;
        notificationSoundRef.current.play().catch(() => {});
      }

      // Only save chat and increment message count for authenticated users
      if (user) {
        try {
          // Save the chat messages first
          await saveChat(
            user.id,
            characterId,
            messagesWithResponse
          );

          // Then increment the message count
          await incrementMessageCount(user.id, characterId);
        } catch (error) {
          console.error('Error saving chat:', error);
          // Don't throw here - the message was sent successfully
        }
      } else {
        // For guest users, just increment the message count in local storage or context
        await incrementMessageCount(null, characterId);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      if (activeRequestsRef.current[characterId]) {
        const errorMessage = { 
          role: 'error', 
          content: 'Failed to send message. Please try again.' 
        };
        updateMessagesForCharacter(characterId, [...updatedMessages, errorMessage]);
      }
    } finally {
      delete activeRequestsRef.current[characterId];
    }
  }, [selectedCharacter, user, canSendMessage, incrementMessageCount, getMessagesForCharacter, updateMessagesForCharacter, updateStreamingMessageForCharacter, updateCharacterMessage, soundEnabled]);

  const loadChat = useCallback(async (characterId) => {
    if (!user) return;

    try {
      setLoadingForCharacter(characterId, true);
      const chats = await getChats(user.id);
      const chat = chats.find(c => c.character_id === characterId);
      
      // Initialize or update the chat state for this character
      setChatStates(prev => ({
        ...prev,
        [characterId]: {
          ...prev[characterId],
          messages: chat?.messages || [],
          isLoading: false,
          streamingMessage: ''
        }
      }));
      
      // If there are messages, update the character's latest message
      if (chat?.messages?.length > 0) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        if (lastMessage.role === 'assistant') {
          updateCharacterMessage(characterId, {
            content: lastMessage.content,
            timestamp: Date.now(),
            isUser: false,
            isUnread: false
          });
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      // Even if there's an error, we'll just start with an empty chat
      setChatStates(prev => ({
        ...prev,
        [characterId]: {
          ...prev[characterId],
          messages: [],
          isLoading: false,
          streamingMessage: ''
        }
      }));
    }
  }, [user, updateCharacterMessage, setLoadingForCharacter]);

  const clearChat = useCallback(() => {
    if (!selectedCharacter) return
    
    const characterId = selectedCharacter.id
    setChatStates(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        messages: [],
        streamingMessage: ''
      }
    }))
  }, [selectedCharacter])

  const deleteChatMessages = useCallback(async (characterId) => {
    if (!user || !characterId) return false
    
    try {
      await deleteChat(user.id, characterId)
      
      // Clear messages for this character
      setChatStates(prev => ({
        ...prev,
        [characterId]: {
          messages: [],
          isLoading: false,
          streamingMessage: ''
        }
      }))
      
      return true
    } catch (error) {
      console.error('Error deleting chat:', error)
      return false
    }
  }, [user])

  // Get the current messages for the selected character
  const currentMessages = selectedCharacter ? getMessagesForCharacter(selectedCharacter.id) : []
  
  // Get the current loading state for the selected character
  const currentIsLoading = selectedCharacter ? chatStates[selectedCharacter.id]?.isLoading || false : false
  
  // Get the current streaming message for the selected character
  const currentStreamingMessage = selectedCharacter ? chatStates[selectedCharacter.id]?.streamingMessage || '' : ''

  const value = {
    messages: selectedCharacter ? (chatStates[selectedCharacter.id]?.messages || []) : [],
    streamingMessage: selectedCharacter ? (chatStates[selectedCharacter.id]?.streamingMessage || '') : '',
    isLoading: selectedCharacter ? (chatStates[selectedCharacter.id]?.isLoading || false) : false,
    sendMessage,
    loadChat,
    deleteChatMessages,
    user,
    getMessagesForCharacter
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}