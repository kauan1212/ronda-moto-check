
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuditLog = () => {
  const logSecurityEvent = useCallback(async (
    action: string,
    targetUserId?: string,
    details?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use rpc or direct SQL to insert into security_audit table
      const { error } = await supabase.rpc('log_security_event', {
        p_user_id: user?.id || null,
        p_action: action,
        p_target_user_id: targetUserId || null,
        p_details: details || {},
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Failed to log security event:', error);
        // Fallback: try direct insert with any cast
        await (supabase as any).from('security_audit').insert({
          user_id: user?.id || null,
          action,
          target_user_id: targetUserId || null,
          details: details || {},
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  return { logSecurityEvent };
};
