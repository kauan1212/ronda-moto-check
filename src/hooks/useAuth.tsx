
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
    let profileTimeout: NodeJS.Timeout;

    const updateAuthState = async (session: Session | null) => {
      if (!mounted) return;
      
      if (profileTimeout) {
        clearTimeout(profileTimeout);
      }

      try {
        if (session?.user) {
          // Always check email first for admin status
          const isAdmin = session.user.email === 'kauankg@hotmail.com';
          
          // Set immediate state with email-based admin check
          if (mounted) {
            setAuthState({
              user: session.user,
              session,
              loading: false,
              isAdmin,
            });
          }

          // Optionally fetch profile data in background for additional info
          if (!isAdmin) {
            profileTimeout = setTimeout(async () => {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('account_status, is_admin')
                  .eq('id', session.user.id)
                  .single();

                if (mounted && profile) {
                  // Check account status
                  if (profile.account_status !== 'active') {
                    await supabase.auth.signOut();
                    return;
                  }

                  // Update admin status if profile indicates admin
                  const finalIsAdmin = session.user.email === 'kauankg@hotmail.com' || profile.is_admin;
                  
                  setAuthState(prev => ({
                    ...prev,
                    isAdmin: finalIsAdmin,
                  }));
                }
              } catch (error) {
                // Silently fail - we already have basic auth working
                console.log('Profile fetch failed, continuing with email-based auth');
              }
            }, 100); // Very short delay for profile check
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
      } catch (error) {
        console.error('Auth state update error:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
          }));
        }
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await updateAuthState(session);
      } catch (error) {
        console.error('Initial session error:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await updateAuthState(session);
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      if (profileTimeout) {
        clearTimeout(profileTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
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
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const forceLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAdmin: false,
      });
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Force logout error:', error);
      window.location.reload();
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    forceLogout,
  };
};
