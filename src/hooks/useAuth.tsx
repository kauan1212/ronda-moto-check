
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

    const updateAuthState = async (session: Session | null) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          // Simple admin check without excessive logging
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, account_status')
            .eq('id', session.user.id)
            .maybeSingle();

          const isAdmin = profile?.is_admin || session.user.email === 'kauankg@hotmail.com';
          
          // Don't block loading for non-critical account status checks
          if (profile?.account_status === 'frozen') {
            await supabase.auth.signOut();
            return;
          }

          if (mounted) {
            setAuthState({
              user: session.user,
              session,
              loading: false,
              isAdmin,
            });
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
        console.error('Auth error:', error);
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
        // Simple security logging without blocking
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              await supabase
                .from('security_audit')
                .insert({
                  user_id: session.user.id,
                  action: 'user_login',
                  details: { login_method: 'password' }
                });
            } catch (error) {
              // Ignore audit errors
            }
          }, 100);
        }

        await updateAuthState(session);
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('📝 Attempting sign up for:', email);
    
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
    console.log('🔐 Signing out user');
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const forceLogout = async () => {
    try {
      console.log('🔐 Force logout initiated');
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
      console.error('💥 Force logout error:', error);
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
