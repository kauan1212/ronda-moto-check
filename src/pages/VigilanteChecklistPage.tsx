import React, { useEffect, useState } from 'react';
import ChecklistForm from '@/components/ChecklistForm';
import CondominiumSelector from '@/components/CondominiumSelector';
import { useCondominiumOperations } from '@/hooks/useCondominiumOperations';
import { Condominium } from '@/types';

const VigilanteChecklistPage = () => {
  // Get condominium ID from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const condominiumId = urlParams.get('condominium') || '';
  
  const { fetchCondominiums, loading } = useCondominiumOperations();
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);

  useEffect(() => {
    fetchCondominiums().then(setCondominiums);
    // eslint-disable-next-line
  }, []);

  const handleSelectCondominium = (condominium: Condominium) => {
    window.location.search = `?condominium=${condominium.id}`;
  };

  if (!condominiumId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro: Condomínio não especificado</h2>
          <p className="text-gray-600">Por favor, selecione o condomínio para continuar.</p>
          <div className="max-w-xs mx-auto">
            <CondominiumSelector
              condominiums={condominiums}
              selectedId={''}
              onSelect={handleSelectCondominium}
              loading={loading}
            />
          </div>
        </div>
      </div>
    );
  }
  
  return <ChecklistForm onComplete={() => window.location.href = '/'} condominiumId={condominiumId} />;
};

export default VigilanteChecklistPage;
