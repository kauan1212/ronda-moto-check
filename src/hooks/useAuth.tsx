
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
    let timeoutId: NodeJS.Timeout;

    console.log('🔄 useAuth: Starting auth initialization');

    // Function to update auth state with timeout protection
    const updateAuthState = async (session: Session | null) => {
      if (!mounted || isUpdating) {
        console.log('⚠️ useAuth: Skipping update - mounted:', mounted, 'isUpdating:', isUpdating);
        return;
      }
      
      isUpdating = true;
      console.log('🔄 useAuth: Updating auth state for user:', session?.user?.email || 'no user');

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.error('⏰ useAuth: Profile check timeout - forcing loading to false');
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
          }));
        }
        isUpdating = false;
      }, 10000); // 10 second timeout
      
      try {
        if (session?.user) {
          console.log('👤 useAuth: User found, checking profile status...');
          
          // Verificar status da conta com retry
          let retryCount = 0;
          const maxRetries = 3;
          let profile = null;
          let profileError = null;

          while (retryCount < maxRetries && !profile) {
            try {
              console.log(`📊 useAuth: Fetching profile (attempt ${retryCount + 1}/${maxRetries})`);
              
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('account_status, is_admin')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error(`❌ useAuth: Profile error (attempt ${retryCount + 1}):`, error);
                profileError = error;
                retryCount++;
                
                if (retryCount < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
                }
              } else {
                profile = profileData;
                console.log('✅ useAuth: Profile fetched successfully:', profile);
                break;
              }
            } catch (fetchError) {
              console.error(`🚨 useAuth: Fetch error (attempt ${retryCount + 1}):`, fetchError);
              retryCount++;
              
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              }
            }
          }

          // Clear timeout on successful completion
          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          if (profileError && !profile) {
            console.error('💥 useAuth: Failed to fetch profile after retries, signing out');
            await supabase.auth.signOut();
            if (mounted) {
              setAuthState({
                user: null,
                session: null,
                loading: false,
                isAdmin: false,
              });
            }
            isUpdating = false;
            return;
          }

          // Se a conta não está ativa, fazer logout
          if (profile && profile.account_status !== 'active') {
            console.log('🚫 useAuth: Account not active, signing out:', profile.account_status);
            await supabase.auth.signOut();
            if (mounted) {
              setAuthState({
                user: null,
                session: null,
                loading: false,
                isAdmin: false,
              });
            }
            isUpdating = false;
            return;
          }

          // Check if user is admin
          const isAdmin = session.user.email === 'kauankg@hotmail.com' || (profile?.is_admin || false);
          console.log('👑 useAuth: Admin status:', isAdmin);
          
          if (mounted) {
            console.log('✅ useAuth: Setting authenticated state');
            setAuthState({
              user: session.user,
              session,
              loading: false,
              isAdmin,
            });
          }
        } else {
          console.log('🚪 useAuth: No user session, setting unauthenticated state');
          // Clear timeout
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          
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
        console.error('💥 useAuth: Unexpected error in updateAuthState:', error);
        
        // Clear timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
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
        console.log('🚀 useAuth: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ useAuth: Error getting session:', error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
          return;
        }
        
        console.log('📋 useAuth: Initial session retrieved:', session ? 'found' : 'not found');
        await updateAuthState(session);
      } catch (error) {
        console.error('💥 useAuth: Error in getInitialSession:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Set up auth state listener
    console.log('👂 useAuth: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 useAuth: Auth state changed:', event, session?.user?.email);
        await updateAuthState(session);
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      console.log('🧹 useAuth: Cleaning up');
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 useAuth: Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.log('❌ useAuth: Sign in error:', error);
      return { data, error };
    }

    // Verificar status da conta após login bem-sucedido
    if (data.user) {
      console.log('✅ useAuth: Sign in successful, checking account status');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ useAuth: Error checking account status:', profileError);
        return { data, error: profileError };
      }

      if (profile.account_status === 'pending') {
        console.log('⏳ useAuth: Account pending approval');
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: { message: 'Sua conta está pendente de aprovação pelo administrador.' }
        };
      }

      if (profile.account_status === 'frozen') {
        console.log('🧊 useAuth: Account frozen');
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: { message: 'Sua conta foi congelada. Entre em contato com o administrador.' }
        };
      }
    }

    console.log('✅ useAuth: Sign in completed successfully');
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('📝 useAuth: Attempting sign up for:', email);
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
    
    console.log('📝 useAuth: Sign up result:', { data, error });
    return { data, error };
  };

  const signOut = async () => {
    console.log('🚪 useAuth: Signing out');
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Emergency logout function to force clear state
  const forceLogout = async () => {
    console.log('🚨 useAuth: Force logout initiated');
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAdmin: false,
      });
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      window.location.reload();
    } catch (error) {
      console.error('💥 useAuth: Error in force logout:', error);
      // Force reload as last resort
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
