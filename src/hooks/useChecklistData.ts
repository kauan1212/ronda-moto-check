
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Motorcycle } from '@/types';
import { toast } from 'sonner';

export const useChecklistData = () => {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vigilantesResult, motorcyclesResult] = await Promise.all([
          supabase.from('vigilantes').select('*'),
          supabase.from('motorcycles').select('*')
        ]);

        if (vigilantesResult.data) setVigilantes(vigilantesResult.data);
        if (motorcyclesResult.data) setMotorcycles(motorcyclesResult.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    fetchData();
  }, []);

  return {
    vigilantes,
    motorcycles
  };
};
