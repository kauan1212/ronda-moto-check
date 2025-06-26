
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import AdminPanel from '@/pages/AdminPanel';
import AdminDashboard from '@/pages/AdminDashboard';

const AuthWrapper = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  if (isAdmin && user.email === 'kauankg@hotmail.com') {
    return <AdminPanel onLogout={() => window.location.reload()} />;
  }

  return <AdminDashboard />;
};

export default AuthWrapper;
