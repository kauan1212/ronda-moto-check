
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
    let isUpdating = false;

    // Function to update auth state
    const updateAuthState = async (session: Session | null) => {
      if (!mounted || isUpdating) return;
      
      isUpdating = true;
      
      try {
        if (session?.user) {
          // Verificar status da conta
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('account_status, is_admin')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            if (mounted) {
              setAuthState({
                user: null,
                session: null,
                loading: false,
                isAdmin: false,
              });
            }
            return;
          }

          // Se a conta não está ativa, fazer logout
          if (profile.account_status !== 'active') {
            console.log('Account not active, signing out:', profile.account_status);
            await supabase.auth.signOut();
            if (mounted) {
              setAuthState({
                user: null,
                session: null,
                loading: false,
                isAdmin: false,
              });
            }
            return;
          }

          // Check if user is admin
          const isAdmin = session.user.email === 'kauankg@hotmail.com' || profile.is_admin;
          
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
        console.error('Error updating auth state:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
          }));
        }
      } finally {
        isUpdating = false;
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
          return;
        }
        await updateAuthState(session);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
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

    // Get initial session
    getInitialSession();

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
    
    if (error) {
      console.log('Sign in error:', error);
      return { data, error };
    }

    // Verificar status da conta após login bem-sucedido
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error checking account status:', profileError);
        return { data, error: profileError };
      }

      if (profile.account_status === 'pending') {
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: { message: 'Sua conta está pendente de aprovação pelo administrador.' }
        };
      }

      if (profile.account_status === 'frozen') {
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: { message: 'Sua conta foi congelada. Entre em contato com o administrador.' }
        };
      }
    }

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
