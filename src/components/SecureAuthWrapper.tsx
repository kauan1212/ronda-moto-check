
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import AdminPanel from '@/pages/AdminPanel';
import AdminDashboard from '@/pages/AdminDashboard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const SecureAuthWrapper = () => {
  const { user, loading, isAdmin, forceLogout } = useAuth();
  const [showEmergencyButton, setShowEmergencyButton] = useState(false);
  const [hasAccessViolation, setHasAccessViolation] = useState(false);

  // Show emergency button after 5 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowEmergencyButton(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowEmergencyButton(false);
    }
  }, [loading]);

  // Check for access violations and log them
  useEffect(() => {
    if (user && !loading) {
      const checkSecurityStatus = async () => {
        try {
          // Verify user account status
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('account_status, is_admin')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('❌ Security check failed:', error);
            setHasAccessViolation(true);
            return;
          }

          // Check for account status violations
          if (profile?.account_status === 'pending') {
            console.log('⚠️ Access violation: Account pending');
            await supabase.rpc('log_security_event', {
              p_action: 'access_violation_pending_account',
              p_details: { user_email: user.email }
            });
            setHasAccessViolation(true);
            await supabase.auth.signOut();
            return;
          }

          if (profile?.account_status === 'frozen') {
            console.log('⚠️ Access violation: Account frozen');
            await supabase.rpc('log_security_event', {
              p_action: 'access_violation_frozen_account',
              p_details: { user_email: user.email }
            });
            setHasAccessViolation(true);
            await supabase.auth.signOut();
            return;
          }

          // Verify admin status consistency
          if (isAdmin !== profile?.is_admin) {
            console.log('⚠️ Admin status inconsistency detected');
            await supabase.rpc('log_security_event', {
              p_action: 'admin_status_inconsistency',
              p_details: { 
                session_admin: isAdmin,
                profile_admin: profile?.is_admin 
              }
            });
          }

          setHasAccessViolation(false);
        } catch (error) {
          console.error('💥 Security check error:', error);
        }
      };

      checkSecurityStatus();
    }
  }, [user, loading, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <img 
            src="/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png" 
            alt="VigioSystem Logo" 
            className="h-16 w-16 object-contain animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-700">🔐 Verificando autenticação e permissões...</div>
          
          {showEmergencyButton && (
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                A verificação de segurança está demorando mais que o esperado.
              </p>
              <Button 
                onClick={forceLogout}
                variant="outline"
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                Forçar Logout e Recarregar
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (hasAccessViolation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-red-800">Acesso Negado</h1>
          <p className="text-red-600">
            Sua conta não tem permissão para acessar o sistema.
            <br />
            Entre em contato com o administrador.
          </p>
          <Button onClick={forceLogout} className="mt-4">
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  if (isAdmin) {
    return <AdminPanel />;
  }

  return <AdminDashboard />;
};

export default SecureAuthWrapper;
