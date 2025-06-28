
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isActive: boolean;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isActive: false
  });

  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());

  // Update last activity time
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Check if session should timeout
  const checkSessionTimeout = useCallback(async () => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeSinceStart = now - sessionStartRef.current;

    if (timeSinceActivity > SESSION_TIMEOUT || timeSinceStart > MAX_SESSION_DURATION) {
      console.log('Session timeout - signing out user');
      await supabase.auth.signOut();
      toast.error('Sessão expirada por inatividade. Faça login novamente.');
      return true;
    }
    return false;
  }, []);

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [updateActivity]);

  // Set up session timeout checking
  useEffect(() => {
    if (authState.session) {
      const checkInterval = setInterval(async () => {
        await checkSessionTimeout();
      }, 60 * 1000); // Check every minute

      return () => clearInterval(checkInterval);
    }
  }, [authState.session, checkSessionTimeout]);

  // Check account status
  const checkAccountStatus = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking account status:', error);
        return false;
      }

      return profile?.account_status === 'active';
    } catch (error) {
      console.error('Error checking account status:', error);
      return false;
    }
  }, []);

  // Audit login attempt using fallback method
  const auditLoginAttempt = useCallback(async (success: boolean, userId?: string, error?: string) => {
    try {
      // Use type assertion to bypass TypeScript errors for security_audit table
      await (supabase as any).from('security_audit').insert({
        user_id: userId || null,
        action: success ? 'login_success' : 'login_failed',
        details: { 
          success,
          error: error || null,
          timestamp: new Date().toISOString()
        },
        ip_address: null, // Would need server-side implementation
        user_agent: navigator.userAgent
      });
    } catch (auditError) {
      console.error('Failed to audit login attempt:', auditError);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          // Check if account is active
          const isActive = await checkAccountStatus(session.user.id);
          
          if (!isActive) {
            await supabase.auth.signOut();
            toast.error('Sua conta está inativa ou pendente de aprovação.');
            await auditLoginAttempt(false, session.user.id, 'Account inactive');
            return;
          }

          // Reset session timing
          lastActivityRef.current = Date.now();
          sessionStartRef.current = Date.now();
          
          await auditLoginAttempt(true, session.user.id);

          setAuthState({
            user: session.user,
            session,
            loading: false,
            isActive: true
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isActive: false
          });
        } else {
          setAuthState(prevState => ({
            ...prevState,
            loading: false
          }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        const isActive = await checkAccountStatus(session.user.id);
        
        if (!isActive) {
          await supabase.auth.signOut();
          toast.error('Sua conta está inativa ou pendente de aprovação.');
          return;
        }

        // Reset session timing
        lastActivityRef.current = Date.now();
        sessionStartRef.current = Date.now();

        setAuthState({
          user: session.user,
          session,
          loading: false,
          isActive: true
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          isActive: false
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAccountStatus, auditLoginAttempt]);

  const signOut = useCallback(async () => {
    try {
      if (authState.user) {
        await (supabase as any).from('security_audit').insert({
          user_id: authState.user.id,
          action: 'logout',
          details: { timestamp: new Date().toISOString() },
          user_agent: navigator.userAgent
        });
      }
      
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during signout:', error);
    }
  }, [authState.user]);

  return {
    ...authState,
    signOut,
    checkAccountStatus
  };
};
