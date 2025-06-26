
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import AdminPanel from '@/pages/AdminPanel';
import AdminDashboard from '@/pages/AdminDashboard';

const AuthWrapper = () => {
  const { user, loading, isAdmin } = useAuth();

  console.log('AuthWrapper state:', { user: user?.email, loading, isAdmin });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-700">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => {
      console.log('Login success callback triggered');
    }} />;
  }

  console.log('User authenticated, showing dashboard for:', { email: user.email, isAdmin });

  if (isAdmin) {
    return <AdminPanel />;
  }

  return <AdminDashboard />;
};

export default AuthWrapper;
