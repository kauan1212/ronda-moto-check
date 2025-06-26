
import React from 'react';
import ChecklistForm from '@/components/ChecklistForm';

const VigilanteChecklistPage = () => {
  return <ChecklistForm onComplete={() => window.location.href = '/'} />;
};

export default VigilanteChecklistPage;
