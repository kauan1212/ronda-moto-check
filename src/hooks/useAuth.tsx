
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
          console.log('🔐 Checking user admin status for:', session.user.email);
          
          // Check admin status from profiles table directly
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('❌ Profile check error:', profileError);
            // Fallback to email check for backwards compatibility
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

          const isAdmin = Boolean(profile?.is_admin);
          console.log('✅ Admin status determined:', isAdmin);

          if (mounted) {
            setAuthState({
              user: session.user,
              session,
              loading: false,
              isAdmin,
            });
          }

          // Check account status for non-admin users
          if (!isAdmin) {
            try {
              const { data: profileStatus } = await supabase
                .from('profiles')
                .select('account_status')
                .eq('id', session.user.id)
                .single();

              if (profileStatus?.account_status === 'pending') {
                console.log('⏳ Account pending approval');
                await supabase.auth.signOut();
                return;
              }

              if (profileStatus?.account_status === 'frozen') {
                console.log('🧊 Account frozen');
                await supabase.auth.signOut();
                return;
              }
            } catch (error) {
              console.error('⚠️ Error checking account status:', error);
              // Continue with login - profile check is not critical
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
      } catch (error) {
        console.error('💥 Auth state update error:', error);
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
        console.log('🔐 Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        await updateAuthState(session);
      } catch (error) {
        console.error('💥 Initial session error:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event);
        
        // Log security events
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await supabase
              .from('security_audit')
              .insert({
                user_id: session.user.id,
                action: 'user_login',
                details: { 
                  login_method: 'password',
                  user_agent: navigator.userAgent 
                }
              });
          } catch (error) {
            console.error('Failed to log login event:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          try {
            await supabase
              .from('security_audit')
              .insert({
                action: 'user_logout',
                details: { user_agent: navigator.userAgent }
              });
          } catch (error) {
            console.error('Failed to log logout event:', error);
          }
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
