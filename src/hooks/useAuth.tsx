
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    // Function to update auth state
    const updateAuthState = async (session: Session | null) => {
      if (!mounted) return;

      if (session?.user) {
        try {
          // Check if user is admin by checking the profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
          
          if (mounted) {
            const isAdmin = profile?.is_admin || session.user.email === 'kauankg@hotmail.com';
            
            setAuthState({
              user: session.user,
              session,
              loading: false,
              isAdmin,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (mounted) {
            const isAdmin = session.user.email === 'kauankg@hotmail.com';
            
            setAuthState({
              user: session.user,
              session,
              loading: false,
              isAdmin,
            });
          }
        }
      } else {
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAdmin: false,
          });
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        await updateAuthState(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('Sign in result:', { data, error });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('Attempting sign up for:', email);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        }
      }
    });
    
    console.log('Sign up result:', { data, error });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};
