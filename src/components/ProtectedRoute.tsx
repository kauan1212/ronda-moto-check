
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from './AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'user:', !!user, 'profile:', !!profile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Require both user and profile for authentication
  if (!user || !profile) {
    console.log('ProtectedRoute - Redirecting to AuthPage');
    return <AuthPage />;
  }

  // Check admin requirement
  if (requireAdmin && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
            <p className="text-slate-600 mb-4">
              Você não tem permissão para acessar esta área. Esta seção é restrita a administradores.
            </p>
            <p className="text-sm text-slate-500">
              Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute - Rendering children for user:', profile.role);
  return <>{children}</>;
};

export default ProtectedRoute;
