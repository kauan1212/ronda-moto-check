
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Motorcycle } from '@/types';
import { toast } from 'sonner';

export const useChecklistData = (condominiumId?: string) => {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for condominium:', condominiumId);
        
        let vigilantesQuery = supabase.from('vigilantes').select('*');
        let motorcyclesQuery = supabase.from('motorcycles').select('*');
        
        // Filter by condominium if provided
        if (condominiumId) {
          vigilantesQuery = vigilantesQuery.eq('condominium_id', condominiumId);
          motorcyclesQuery = motorcyclesQuery.eq('condominium_id', condominiumId);
        }

        const [vigilantesResult, motorcyclesResult] = await Promise.all([
          vigilantesQuery,
          motorcyclesQuery
        ]);

        console.log('Vigilantes found:', vigilantesResult.data?.length);
        console.log('Motorcycles found:', motorcyclesResult.data?.length);

        if (vigilantesResult.data) setVigilantes(vigilantesResult.data);
        if (motorcyclesResult.data) setMotorcycles(motorcyclesResult.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    fetchData();
  }, [condominiumId]);

  return {
    vigilantes,
    motorcycles
  };
};
