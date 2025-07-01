
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityMonitor = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Simplified security monitoring without excessive database calls
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key?.includes('supabase') && e.oldValue !== e.newValue) {
        try {
          await supabase
            .from('security_audit')
            .insert({
              user_id: user.id,
              action: 'session_storage_modified',
              details: { 
                key: e.key,
                suspicious: true 
              }
            });
        } catch (error) {
          // Ignore audit errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id]);

  // Function to manually report security incidents
  const reportSecurityIncident = async (incident: string, details: any = {}) => {
    try {
      await supabase
        .from('security_audit')
        .insert({
          user_id: user?.id,
          action: `security_incident_${incident}`,
          details: {
            ...details,
            reported_by_user: true,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      // Ignore audit errors
    }
  };

  return {
    reportSecurityIncident
  };
};
