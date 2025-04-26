// This script checks if your Supabase connection is working correctly
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkSupabaseConnection() {
  console.log('Checking Supabase connection...');
  
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
    return;
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local');
    return;
  }
  
  console.log('✅ Environment variables are set');
  
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Check if we can connect to Supabase
  try {
    console.log('Testing connection to Supabase...');
    
    // Try to get the current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth connection successful');
    }
    
    // Try a simple query to check if database is accessible
    const { data, error } = await supabase
      .from('chats')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database error:', error.message);
      
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
    } else {
      console.log('✅ Database connection successful');
    }
    
    // Check if auth.users table exists
    const { data: usersData, error: usersError } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('❌ auth.users table error:', usersError.message);
      console.log('This is expected as the auth.users table is not directly accessible.');
      console.log('The error should not affect user signup functionality.');
    } else {
      console.log('✅ auth.users table is accessible');
    }
    
    console.log('Supabase connection check complete!');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkSupabaseConnection(); 