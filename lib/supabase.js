import supabase from '@/utils/supabase/client'

// Check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    // Try to get the current user to check if auth is working
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Supabase auth error:', authError)
      return { 
        connected: false, 
        error: `Auth error: ${authError.message}` 
      }
    }
    
    // Try a simple query to check if database is accessible
    const { data, error } = await supabase
      .from('chats')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase database error:', error)
      return { 
        connected: false, 
        error: `Database error: ${error.message}` 
      }
    }
    
    return { connected: true }
  } catch (error) {
    console.error('Supabase connection check error:', error)
    return { 
      connected: false, 
      error: `Connection error: ${error.message}` 
    }
  }
}

// Check if message_counts table exists and has correct schema
export const createMessageCountsTable = async () => {
  try {
    // Simple check if table exists and has correct schema
    const { error } = await supabase
      .from('message_counts')
      .select('id, user_id, character_id, count')
      .limit(1);

    if (error) {
      console.error('Error checking message_counts table:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createMessageCountsTable:', error);
    return false;
  }
}

// Auth helpers
export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Chat helpers
export const saveChat = async (userId, characterId, messageCount) => {
  if (!userId || !characterId || typeof messageCount !== 'number') {
    return null;
  }

  const count = Math.max(0, Math.floor(messageCount));

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const { data: existingData, error: existingError } = await supabase
      .from('message_counts')
      .select('count')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .eq('date', todayStr)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      return null;
    }

    const { data, error } = await supabase
      .from('message_counts')
      .upsert({
        user_id: userId,
        character_id: characterId,
        count: count,
        date: todayStr,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,character_id,date',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
}

export const getChats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting chats:', error.message || 'Unknown error');
      // If the table doesn't exist, log a helpful message
      if (error.message && error.message.includes('does not exist')) {
        console.log('The "chats" table does not exist in your Supabase database.');
        console.log('Please create it with the following SQL:');
        console.log(`
          create table public.chats (
            id uuid default uuid_generate_v4() primary key,
            user_id uuid references auth.users on delete cascade not null,
            character_id text not null,
            messages jsonb not null,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null
          );
        `);
      }
      // Return empty array instead of throwing
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Unexpected error getting chats:', error);
    return [];
  }
}

export const deleteChat = async (userId, characterId) => {
  try {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Always use the session user ID for consistency
    const user_id = session?.user?.id
    
    if (!user_id) {
      console.error('No authenticated user found for deleting chat')
      return false
    }

    console.log('Deleting chat with user_id:', user_id, 'character_id:', characterId)

    // Delete the chat
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('user_id', user_id)
      .eq('character_id', characterId)
    
    if (error) {
      console.error('Error deleting chat:', error.message || 'Unknown error')
      console.error('Error details:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Unexpected error deleting chat:', error)
    return false
  }
}
