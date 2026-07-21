import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get initial user session
    const getInitialUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching Supabase user:', error.message);
        }
        setUser(currentUser);
      } catch (err) {
        console.error('Error in useAuth hook getUser init:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      return { data, error: null };
    } catch (error: any) {
      console.error('Login error in useAuth wrapper:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, options?: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });
      if (error) throw error;
      setUser(data.user);
      return { data, error: null };
    } catch (error: any) {
      console.error('Signup error in useAuth wrapper:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { error: null };
    } catch (error: any) {
      console.error('Signout error in useAuth wrapper:', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(currentUser);
      return currentUser;
    } catch (error: any) {
      console.error('getUser error in useAuth wrapper:', error.message);
      return null;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getUser,
  };
}
