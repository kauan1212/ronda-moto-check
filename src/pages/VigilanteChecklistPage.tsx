
import React from 'react';
import ChecklistForm from '@/components/ChecklistForm';

const VigilanteChecklistPage = () => {
  // Get condominium ID from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const condominiumId = urlParams.get('condominium') || '';
  
  console.log('VigilanteChecklistPage - Condominium ID from URL:', condominiumId);
  
  if (!condominiumId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro: Condomínio não especificado</h2>
          <p className="text-gray-600">Por favor, acesse através do dashboard do condomínio.</p>
        </div>
      </div>
    );
  }
  
  return <ChecklistForm onComplete={() => window.location.href = '/'} condominiumId={condominiumId} />;
};

export default VigilanteChecklistPage;
