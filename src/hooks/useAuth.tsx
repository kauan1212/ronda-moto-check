
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authCache } from '@/utils/authCache';

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
    let timeoutId: NodeJS.Timeout;

    console.log('🔄 useAuth: Starting auth initialization');

    // Function to update auth state with better error handling
    const updateAuthState = async (session: Session | null) => {
      if (!mounted) {
        console.log('⚠️ useAuth: Component unmounted, skipping update');
        return;
      }
      
      console.log('🔄 useAuth: Updating auth state for user:', session?.user?.email || 'no user');

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      try {
        if (session?.user) {
          console.log('👤 useAuth: User found, checking profile status...');
          
          // Check cache first
          const cachedProfile = authCache.get(session.user.id);
          if (cachedProfile) {
            console.log('✅ useAuth: Using cached profile data');
            const isAdmin = session.user.email === 'kauankg@hotmail.com' || (cachedProfile?.is_admin || false);
            
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                loading: false,
                isAdmin,
              });
            }
            return;
          }

          // Set a shorter timeout for profile check
          timeoutId = setTimeout(() => {
            console.log('⏰ useAuth: Profile check timeout, proceeding without profile data');
            if (mounted) {
              // Just proceed with basic admin check based on email
              const isAdmin = session.user.email === 'kauankg@hotmail.com';
              setAuthState({
                user: session.user,
                session,
                loading: false,
                isAdmin,
              });
            }
          }, 5000); // Reduced to 5 seconds
          
          try {
            console.log('📊 useAuth: Fetching profile from database');
            
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('account_status, is_admin')
              .eq('id', session.user.id)
              .single();

            // Clear timeout on response
            if (timeoutId) {
              clearTimeout(timeoutId);
            }

            if (error) {
              console.error('❌ useAuth: Profile error, proceeding with email-based admin check:', error);
              // Proceed with basic admin check if profile query fails
              const isAdmin = session.user.email === 'kauankg@hotmail.com';
              
              if (mounted) {
                setAuthState({
                  user: session.user,
                  session,
                  loading: false,
                  isAdmin,
                });
              }
              return;
            }

            console.log('✅ useAuth: Profile fetched successfully:', profile);

            // Cache the profile data
            authCache.set(session.user.id, profile);

            // Check account status
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
          } catch (fetchError) {
            console.error('🚨 useAuth: Fetch error, proceeding with email-based admin check:', fetchError);
            
            // Clear timeout
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            
            // Proceed with basic admin check
            const isAdmin = session.user.email === 'kauankg@hotmail.com';
            
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                loading: false,
                isAdmin,
              });
            }
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
    // Clear cache on logout
    if (authState.user) {
      authCache.clear(authState.user.id);
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Emergency logout function to force clear state
  const forceLogout = async () => {
    console.log('🚨 useAuth: Force logout initiated');
    try {
      // Clear all cached data
      authCache.clear();
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
