
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import AdminPanel from '@/pages/AdminPanel';
import AdminDashboard from '@/pages/AdminDashboard';

const AuthWrapper = () => {
  const { user, loading, isAdmin } = useAuth();

  console.log('AuthWrapper render - user:', user?.email, 'loading:', loading, 'isAdmin:', isAdmin);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, showing LoginPage');
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  console.log('User found:', user.email, 'isAdmin:', isAdmin);

  if (isAdmin && user.email === 'kauankg@hotmail.com') {
    console.log('Showing AdminPanel for admin user');
    return <AdminPanel onLogout={() => window.location.reload()} />;
  }

  console.log('Showing AdminDashboard for regular user');
  return <AdminDashboard />;
};

export default AuthWrapper;
