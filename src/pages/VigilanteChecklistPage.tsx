
import React from 'react';
import ChecklistForm from '@/components/ChecklistForm';

const VigilanteChecklistPage = () => {
  return <ChecklistForm onBack={() => window.location.href = '/'} />;
};

export default VigilanteChecklistPage;
