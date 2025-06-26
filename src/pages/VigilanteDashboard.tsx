
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Condominium } from '@/types';
import CondominiumSelector from '@/components/CondominiumSelector';
import Dashboard from '@/components/Dashboard';

const VigilanteDashboard = () => {
  const [selectedCondominium, setSelectedCondominium] = useState<Condominium | null>(null);

  const { data: condominiums = [], isLoading: condominiumsLoading } = useQuery({
    queryKey: ['condominiums'],
    queryFn: async () => {
      console.log('Fetching condominiums for vigilante dashboard...');
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching condominiums:', error);
        throw error;
      }
      
      console.log('Fetched condominiums:', data?.length);
      return data as Condominium[];
    }
  });

  const handleCondominiumSelect = (condominium: Condominium) => {
    setSelectedCondominium(condominium);
  };

  const handleBack = () => {
    setSelectedCondominium(null);
  };

  if (!selectedCondominium) {
    return (
      <CondominiumSelector 
        condominiums={condominiums}
        selectedId={selectedCondominium?.id || ''}
        onSelect={handleCondominiumSelect}
        loading={condominiumsLoading}
      />
    );
  }

  return (
    <Dashboard 
      selectedCondominium={selectedCondominium} 
      onBack={handleBack}
    />
  );
};

export default VigilanteDashboard;
