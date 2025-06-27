
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Condominium } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const useCondominiumOperations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchCondominiums = async (): Promise<Condominium[]> => {
    if (!user) {
      console.log('No user found, skipping fetch');
      return [];
    }

    setLoading(true);
    try {
      console.log('Fetching condominiums for user:', user.id, user.email);
      
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching condominiums:', error);
        toast.error('Erro ao carregar condomínios: ' + error.message);
        return [];
      }

      console.log('Fetched condominiums:', data?.length || 0, 'for user:', user.id);
      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching condominiums:', error);
      toast.error('Erro inesperado ao carregar condomínios');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveCondominium = async (values: any, editingCondominium: Condominium | null) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      console.log('Saving condominium with user_id:', user.id);

      const condominiumData = {
        name: values.name.trim(),
        address: values.address?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
        user_id: user.id,
      };

      if (editingCondominium) {
        console.log('Updating condominium:', editingCondominium.id);
        const { error } = await supabase
          .from('condominiums')
          .update(condominiumData)
          .eq('id', editingCondominium.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating condominium:', error);
          throw error;
        }
        toast.success('Condomínio atualizado com sucesso!');
      } else {
        console.log('Creating new condominium for user:', user.id);
        const { error } = await supabase
          .from('condominiums')
          .insert([condominiumData]);

        if (error) {
          console.error('Error creating condominium:', error);
          throw error;
        }
        toast.success('Condomínio criado com sucesso!');
      }

      return true;
    } catch (error: any) {
      console.error('Error saving condominium:', error);
      toast.error('Erro ao salvar condomínio: ' + (error.message || 'Erro desconhecido'));
      return false;
    }
  };

  const deleteCondominium = async (condominium: Condominium) => {
    if (condominium.user_id !== user?.id) {
      toast.error('Você não tem permissão para deletar este condomínio');
      return false;
    }

    if (!confirm(`Tem certeza que deseja excluir o condomínio "${condominium.name}"? Esta ação não pode ser desfeita.`)) {
      return false;
    }

    try {
      console.log('Deleting condominium:', condominium.id, 'for user:', user?.id);
      const { error } = await supabase
        .from('condominiums')
        .delete()
        .eq('id', condominium.id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting condominium:', error);
        throw error;
      }
      toast.success('Condomínio excluído com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error deleting condominium:', error);
      toast.error('Erro ao excluir condomínio: ' + (error.message || 'Erro desconhecido'));
      return false;
    }
  };

  return {
    loading,
    fetchCondominiums,
    saveCondominium,
    deleteCondominium,
  };
};
