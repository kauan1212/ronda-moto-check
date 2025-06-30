
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import AdminPanel from '@/pages/AdminPanel';
import AdminDashboard from '@/pages/AdminDashboard';
import { Button } from '@/components/ui/button';

const AuthWrapper = () => {
  const { user, loading, isAdmin, forceLogout } = useAuth();
  const [showEmergencyButton, setShowEmergencyButton] = useState(false);

  // Show emergency button after 5 seconds (much faster)
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
          <div className="text-lg text-gray-700">Verificando autenticação...</div>
          
          {showEmergencyButton && (
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                A verificação está demorando mais que o esperado.
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

  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  if (isAdmin) {
    return <AdminPanel />;
  }

  return <AdminDashboard />;
};

export default AuthWrapper;
