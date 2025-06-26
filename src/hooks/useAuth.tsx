
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
      console.log('updateAuthState called with session:', session);
      
      if (!mounted) {
        console.log('Component unmounted, skipping update');
        return;
      }

      if (session?.user) {
        console.log('User found, checking admin status for:', session.user.email);
        
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
          
          console.log('Profile query result:', { profile, error });
          
          if (mounted) {
            const isAdmin = profile?.is_admin || false;
            console.log('Setting auth state - isAdmin:', isAdmin);
            
            setAuthState({
              user: session.user,
              session,
              loading: false,
              isAdmin,
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          if (mounted) {
            console.log('Error occurred, setting auth state with isAdmin: false');
            setAuthState({
              user: session.user,
              session,
              loading: false,
              isAdmin: false,
            });
          }
        }
      } else {
        console.log('No user in session, setting auth state to logged out');
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

    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'Session:', session?.user?.email);
        await updateAuthState(session);
      }
    );

    // Check for existing session
    console.log('Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('getSession result:', { session: session?.user?.email, error });
      updateAuthState(session);
    });

    return () => {
      console.log('Cleaning up auth hook...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('Sign in result:', { error });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  console.log('Current auth state:', authState);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};
