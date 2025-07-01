
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityMonitor = () => {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Monitor for suspicious activity patterns
    const monitorActivity = () => {
      // Track page visibility changes (potential tab switching attacks)
      const handleVisibilityChange = async () => {
        if (document.hidden) {
          try {
            await supabase
              .from('security_audit')
              .insert({
                user_id: user.id,
                action: 'session_hidden',
                details: { timestamp: new Date().toISOString() }
              });
          } catch (error) {
            console.error('Failed to log visibility change:', error);
          }
        }
      };

      // Track potential session hijacking attempts
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
            console.error('Failed to log storage change:', error);
          }
        }
      };

      // Track rapid navigation patterns (potential automated attacks)
      let navigationCount = 0;
      const handleNavigation = async () => {
        navigationCount++;
        if (navigationCount > 20) { // More than 20 navigations in 1 minute
          try {
            await supabase
              .from('security_audit')
              .insert({
                user_id: user.id,
                action: 'suspicious_navigation_pattern',
                details: { 
                  count: navigationCount,
                  timespan: '1_minute'
                }
              });
          } catch (error) {
            console.error('Failed to log navigation pattern:', error);
          }
        }
      };

      // Reset navigation counter every minute
      const resetNavigationCounter = () => {
        navigationCount = 0;
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('beforeunload', handleNavigation);
      
      const navigationResetInterval = setInterval(resetNavigationCounter, 60000);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('beforeunload', handleNavigation);
        clearInterval(navigationResetInterval);
      };
    };

    const cleanup = monitorActivity();

    return cleanup;
  }, [user, isAdmin]);

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
      console.log('🔒 Security incident reported:', incident);
    } catch (error) {
      console.error('❌ Failed to report security incident:', error);
    }
  };

  return {
    reportSecurityIncident
  };
};
