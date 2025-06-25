
import React, { useState } from 'react';
import { Condominium } from '@/types';
import CondominiumManagement from '@/components/CondominiumManagement';
import Dashboard from '@/components/Dashboard';

const AdminDashboard = () => {
  const [selectedCondominium, setSelectedCondominium] = useState<Condominium | null>(null);

  const handleCondominiumSelect = (condominium: Condominium) => {
    setSelectedCondominium(condominium);
  };

  const handleBack = () => {
    setSelectedCondominium(null);
  };

  if (!selectedCondominium) {
    return <CondominiumManagement onSelect={handleCondominiumSelect} />;
  }

  return (
    <Dashboard 
      selectedCondominium={selectedCondominium} 
      onBack={handleBack}
    />
  );
};

export default AdminDashboard;
