
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from './AdminDashboard';

const Index = () => {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
};

export default Index;
