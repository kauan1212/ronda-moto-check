
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
        <div className="text-lg">Carregando...</div>
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
    return <AdminPanel onLogout={() => {
      console.log('Logout triggered');
      window.location.reload();
    }} />;
  }

  return <AdminDashboard />;
};

export default AuthWrapper;
