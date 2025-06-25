
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';

const Index = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else if (user.role === 'vigilante') {
        window.location.href = '/vigilante';
      }
    }
  }, [user]);

  return <LoginPage />;
};

export default Index;
