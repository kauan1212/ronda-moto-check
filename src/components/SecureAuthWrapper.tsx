
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

  // Show emergency button after 2 seconds for faster UX
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowEmergencyButton(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowEmergencyButton(false);
    }
  }, [loading]);

  // Real-time security check for all non-admin users
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (user && !loading && !isAdmin) {
      // Check for specific blocked email first
      if (user.email === 'testedesistemavistoria@gmail.com') {
        console.log('🚫 Usuário bloqueado detectado:', user.email);
        setHasAccessViolation(true);
        return;
      }

      // Initial check with delay
      timeoutId = setTimeout(async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('account_status')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.account_status === 'frozen') {
            console.log('🚫 Conta congelada detectada - forçando logout');
            setHasAccessViolation(true);
            await supabase.auth.signOut();
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar status da conta:', error);
        }
      }, 500);

      // Continuous check every 3 seconds for real-time blocking
      intervalId = setInterval(async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('account_status')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.account_status === 'frozen') {
            console.log('🚫 Conta congelada detectada em tempo real - forçando logout');
            setHasAccessViolation(true);
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error('Erro ao verificar status da conta em tempo real:', error);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user?.id, user?.email, isAdmin, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
          <div className="relative">
            <img 
              src="/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png" 
              alt="VigioSystem Logo" 
              className="h-20 w-20 object-contain"
            />
            <div className="absolute -bottom-2 -right-2 animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-foreground">Carregando sistema...</div>
            <div className="text-sm text-muted-foreground">Aguarde um momento</div>
          </div>
          
          {showEmergencyButton && (
            <div className="mt-6 text-center space-y-3 animate-fade-in">
              <p className="text-sm text-muted-foreground">
                Carregamento está demorando?
              </p>
              <Button 
                onClick={forceLogout}
                variant="outline"
                size="sm"
                className="hover-scale"
              >
                Recarregar Aplicação
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
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-red-800">Acesso Negado</h1>
          <p className="text-red-600 text-lg">
            Sua conta não tem permissão para acessar o sistema.
          </p>
          <Button onClick={forceLogout} className="mt-6" variant="outline">
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
