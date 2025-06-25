
import React, { useState } from 'react';
import { Condominium } from '@/types';
import CondominiumManagement from '@/components/CondominiumManagement';
import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminDashboard = () => {
  const [selectedCondominium, setSelectedCondominium] = useState<Condominium | null>(null);

  const handleCondominiumSelect = (condominium: Condominium) => {
    setSelectedCondominium(condominium);
  };

  const handleBack = () => {
    setSelectedCondominium(null);
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      {!selectedCondominium ? (
        <CondominiumManagement onSelect={handleCondominiumSelect} />
      ) : (
        <Dashboard 
          selectedCondominium={selectedCondominium} 
          onBack={handleBack}
        />
      )}
    </ProtectedRoute>
  );
};

export default AdminDashboard;
