"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import supabase from '@/utils/supabase/client';

const AuthContext = createContext({ 
  user: null, 
  session: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load user's theme preference if they're logged in
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('chosen_theme')
            .eq('id', session.user.id)
            .single();
            
          if (profile?.chosen_theme) {
            setTheme(profile.chosen_theme);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load user's theme preference when they sign in
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('chosen_theme')
            .eq('id', session.user.id)
            .single();
            
          if (profile?.chosen_theme) {
            setTheme(profile.chosen_theme);
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      console.log('Starting signin process for:', email);
      setLoading(true);
      setError(null);
      
      // Attempt to sign in with provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Auth signin response:', data?.session ? 'Session created' : 'No session', error ? `Error: ${error.message}` : 'No error');
      
      if (error) {
        console.error('Error during auth.signInWithPassword:', error);
        throw error;
      }
      
      if (!data?.session) {
        console.error('No session returned from signIn');
        throw new Error('Failed to create session. Please try again.');
      }
      
      console.log('Signin successful for user:', data.user?.id);
      return data;
    } catch (err) {
      console.error('Signin process failed with error:', err);
      setError(err.message || 'An unknown error occurred during signin');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, username) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting signup process for:', email);
      
      // Check if username already exists
      console.log('Checking if username exists:', username);
      const { data: existingUsers, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      
      if (usernameError) {
        console.error('Error checking username:', usernameError);
        throw usernameError;
      }
      
      if (existingUsers) {
        console.log('Username already exists:', username);
        const usernameExistsError = new Error('Username already exists. Please choose a different username.');
        setError(usernameExistsError.message);
        throw usernameExistsError;
      }
      
      // Create the user account
      console.log('Creating auth user with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      console.log('Auth signup response:', data?.user ? 'User created' : 'No user data', error ? `Error: ${error.message}` : 'No error');
      
      if (error) {
        console.error('Error during auth.signUp:', error);
        throw error;
      }
      
      if (!data?.user) {
        console.error('No user returned from signUp');
        throw new Error('Failed to create user account. Please try again.');
      }

      // Insert a new profile if it doesn't exist yet
      console.log('Creating profile for user ID:', data.user.id);
      try {
        const now = new Date().toISOString();
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id,
            email: email,
            username: username,
            created_at: now,
            updated_at: now,
            subscription_tier: 'FREE', // Default value
            subscription_status: 'inactive', // Default value
            sound_enabled: true, // Default value
            email_notifications: true, // Default value
            chosen_theme: 'system', // Default value
            is_private: false, // Default value
            is_active: true, // Default value
            followers: 0, // Default value for followers count
            followed_accounts: [] // Default value for followed accounts as empty array
          }, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Continue despite profile error - at least the auth user is created
          setError(`User created but profile setup failed: ${insertError.message}`);
        } else {
          console.log('Profile created successfully');
        }
      } catch (profileError) {
        console.error('Exception creating profile:', profileError);
        // Continue despite profile error - at least the auth user is created
        setError(`User created but profile setup failed: ${profileError.message}`);
      }
      
      console.log('Signup process completed successfully');
      return data;
    } catch (err) {
      console.error('Signup process failed with error:', err);
      setError(err.message || 'An unknown error occurred during signup');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
