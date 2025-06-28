
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
      
      // Direct insert into security_audit table using type assertion
      const { error } = await (supabase as any).from('security_audit').insert({
        user_id: user?.id || null,
        action,
        target_user_id: targetUserId || null,
        details: details || {},
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  return { logSecurityEvent };
};
