import supabase from '@/utils/supabase/client'

/**
 * Debug utility to check authentication and RLS policies
 */
export async function debugAuthAndRLS() {
  // Check current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    console.error('Error getting user:', userError)
    return { error: 'Failed to get user', details: userError }
  }
  
  if (!user) {
    console.warn('No authenticated user found')
    return { error: 'No authenticated user' }
  }
  
  console.log('Authenticated user:', {
    id: user.id,
    email: user.email,
    role: user.role
  })
  
  // Try to insert a test chat
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([
        { 
          user_id: user.id,
          character_id: 'test-character', 
          messages: [{ role: 'system', content: 'Test message' }]
        }
      ])
      .select()
    
    if (error) {
      console.error('Error inserting test chat:', error)
      return { 
        error: 'Failed to insert test chat', 
        details: error,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    }
    
    console.log('Successfully inserted test chat:', data)
    
    // Clean up the test chat
    await supabase
      .from('chats')
      .delete()
      .eq('character_id', 'test-character')
    
    return { 
      success: true, 
      message: 'RLS policies are working correctly',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  } catch (error) {
    console.error('Unexpected error in debug function:', error)
    return { 
      error: 'Unexpected error', 
      details: error,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  }
} 