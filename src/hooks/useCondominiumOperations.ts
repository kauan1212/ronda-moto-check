
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Condominium } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const useCondominiumOperations = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchCondominiums = async (): Promise<Condominium[]> => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      console.log('Auth still loading, skipping fetch');
      return [];
    }

    if (!user?.id) {
      console.log('No user found, returning empty array');
      return [];
    }

    setLoading(true);
    try {
      console.log('🏢 Fetching accessible condominiums for user:', user.id, user.email);
      
      // With RLS policies in place, this will now only return condominiums the user can access
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching condominiums:', error);
        toast.error('Erro ao carregar condomínios: ' + error.message);
        return [];
      }

      console.log('✅ Successfully fetched condominiums:', data?.length || 0, 'items');
      console.log('🔒 RLS-filtered condominium data:', data);
      return data || [];
    } catch (error) {
      console.error('💥 Unexpected error fetching condominiums:', error);
      toast.error('Erro inesperado ao carregar condomínios');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const refreshCondominiums = async (): Promise<Condominium[]> => {
    console.log('🔄 Refreshing condominiums...');
    return await fetchCondominiums();
  };

  const saveCondominium = async (values: any, editingCondominium: Condominium | null) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      console.log('💾 Saving condominium with user_id:', user.id);

      const condominiumData = {
        name: values.name.trim(),
        address: values.address?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
        user_id: user.id,
      };

      if (editingCondominium) {
        console.log('📝 Updating condominium:', editingCondominium.id);
        
        // RLS policies will automatically verify user can update this condominium
        const { error } = await supabase
          .from('condominiums')
          .update(condominiumData)
          .eq('id', editingCondominium.id);

        if (error) {
          console.error('❌ Error updating condominium:', error);
          throw error;
        }
        
        // Log the security event
        await supabase.rpc('log_security_event', {
          p_action: 'condominium_updated',
          p_details: { condominium_id: editingCondominium.id }
        });
        
        toast.success('Condomínio atualizado com sucesso!');
      } else {
        console.log('➕ Creating new condominium for user:', user.id);
        
        // RLS policies will automatically verify user can create condominiums
        const { error } = await supabase
          .from('condominiums')
          .insert([condominiumData]);

        if (error) {
          console.error('❌ Error creating condominium:', error);
          throw error;
        }
        
        // Log the security event
        await supabase.rpc('log_security_event', {
          p_action: 'condominium_created',
          p_details: { condominium_name: condominiumData.name }
        });
        
        toast.success('Condomínio criado com sucesso!');
      }

      return true;
    } catch (error: any) {
      console.error('💥 Error saving condominium:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('row-level security')) {
        toast.error('Você não tem permissão para realizar esta operação');
      } else {
        toast.error('Erro ao salvar condomínio: ' + (error.message || 'Erro desconhecido'));
      }
      return false;
    }
  };

  const deleteCondominium = async (condominium: Condominium) => {
    // Additional client-side check for non-admin users
    if (!isAdmin && condominium.user_id !== user?.id) {
      toast.error('Você não tem permissão para deletar este condomínio');
      return false;
    }

    if (!confirm(`Tem certeza que deseja excluir o condomínio "${condominium.name}"? Esta ação não pode ser desfeita.`)) {
      return false;
    }

    try {
      console.log('🗑️ Deleting condominium:', condominium.id, 'for user:', user?.id);
      
      // RLS policies will automatically verify user can delete this condominium
      const { error } = await supabase
        .from('condominiums')
        .delete()
        .eq('id', condominium.id);

      if (error) {
        console.error('❌ Error deleting condominium:', error);
        throw error;
      }
      
      // Log the security event
      await supabase.rpc('log_security_event', {
        p_action: 'condominium_deleted',
        p_details: { 
          condominium_id: condominium.id,
          condominium_name: condominium.name 
        }
      });
      
      toast.success('Condomínio excluído com sucesso!');
      return true;
    } catch (error: any) {
      console.error('💥 Error deleting condominium:', error);
      
      if (error.message?.includes('row-level security')) {
        toast.error('Você não tem permissão para deletar este condomínio');
      } else {
        toast.error('Erro ao excluir condomínio: ' + (error.message || 'Erro desconhecido'));
      }
      return false;
    }
  };

  return {
    loading,
    authLoading,
    fetchCondominiums,
    refreshCondominiums,
    saveCondominium,
    deleteCondominium,
  };
};
