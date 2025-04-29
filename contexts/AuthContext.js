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
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, username) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if username already exists
      const { data: existingUsers, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      
      if (usernameError) throw usernameError;
      
      if (existingUsers) {
        const usernameExistsError = new Error('Username already exists. Please choose a different username.');
        setError(usernameExistsError.message);
        throw usernameExistsError;
      }
      
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (error) throw error;
      
      // Update the profile with the username
      if (data?.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ username })
          .eq('id', data.user.id);
          
        if (updateError) console.error('Error updating profile:', updateError);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
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
