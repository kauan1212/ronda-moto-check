
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ChecklistForm from '@/components/ChecklistForm';

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'checklist'>('dashboard');

  const handleStartChecklist = () => {
    setCurrentView('checklist');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <Layout>
      {currentView === 'dashboard' && (
        <Dashboard onStartChecklist={handleStartChecklist} />
      )}
      
      {currentView === 'checklist' && (
        <ChecklistForm onBack={handleBackToDashboard} />
      )}
    </Layout>
  );
};

export default Index;
