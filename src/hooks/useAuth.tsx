
import React, { useEffect, useState } from 'react';
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
    let hasInitialized = false;

    const updateAuthState = (session: Session | null) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          const isAdmin = session.user.email === 'kauankg@hotmail.com';
          
          setAuthState({
            user: session.user,
            session,
            loading: false,
            isAdmin,
          });

          // Verificação contínua para usuários não-admin
          if (!isAdmin) {
            // Verificação inicial
            setTimeout(async () => {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('account_status')
                  .eq('id', session.user.id)
                  .maybeSingle();

                if (profile?.account_status === 'frozen' && mounted) {
                  console.log('🚫 Conta congelada detectada no useAuth - forçando logout');
                  await supabase.auth.signOut();
                }
              } catch (error) {
                console.error('Erro ao verificar perfil:', error);
              }
            }, 100);

            // Verificação contínua a cada 2 segundos
            const intervalId = setInterval(async () => {
              if (!mounted) return;
              
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('account_status')
                  .eq('id', session.user.id)
                  .maybeSingle();

                if (profile?.account_status === 'frozen') {
                  console.log('🚫 Conta congelada detectada em tempo real no useAuth - forçando logout');
                  await supabase.auth.signOut();
                }
              } catch (error) {
                console.error('Erro ao verificar perfil em tempo real:', error);
              }
            }, 2000);

            // Limpar interval quando o componente for desmontado
            setTimeout(() => {
              if (!mounted) clearInterval(intervalId);
            }, 100);
          }

        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAdmin: false,
          });
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

    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        updateAuthState(session);
      }
    );

    // Get initial session only once
    if (!hasInitialized) {
      hasInitialized = true;
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          updateAuthState(session);
        })
        .catch((error) => {
          console.error('Initial session error:', error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        });
    }

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
