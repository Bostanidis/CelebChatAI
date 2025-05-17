import { getCharacterById } from './characters';
import supabase from '@/utils/supabase/client';

export async function streamChatResponse(messages, characterId) {
  console.log('Sending request to chat API...');
  
  // Get character information
  const character = await getCharacterById(characterId);
  if (!character) {
    throw new Error(`Character not found: ${characterId}`);
  }

  console.log('Request payload:', { messages, characterId, character });

  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        messages, 
        characterId,
        character: {
          name: character.name,
          description: character.description,
          personality: character.personality,
          background: character.background,
          systemPrompt: character.systemPrompt,
          exampleDialogue: character.exampleDialogue
        },
        isGuest: !session
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      // Try to get more detailed error information
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.message || '';
        console.error('Error details from server:', errorData);
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      
      throw new Error(`HTTP error! status: ${response.status}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }

    // Return the response body directly for streaming
    return response.body;
  } catch (error) {
    console.error('Error in streamChatResponse:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}