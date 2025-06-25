
import React from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';

const VigilanteDashboard = () => {
  return <Dashboard onStartChecklist={() => window.location.href = '/vigilante/checklist'} />;
};

export default VigilanteDashboard;
