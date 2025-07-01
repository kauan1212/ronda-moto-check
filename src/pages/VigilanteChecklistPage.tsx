
import React from 'react';
import ChecklistForm from '@/components/ChecklistForm';

const VigilanteChecklistPage = () => {
  // Get condominium ID from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const condominiumId = urlParams.get('condominium') || '';
  
  return <ChecklistForm onComplete={() => window.location.href = '/'} condominiumId={condominiumId} />;
};

export default VigilanteChecklistPage;
