
import React, { useState, useEffect } from 'react';
import { Condominium } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCondominiumOperations } from '@/hooks/useCondominiumOperations';
import { supabase } from '@/integrations/supabase/client';
import CondominiumHeader from '@/components/condominium/CondominiumHeader';
import CondominiumCard from '@/components/condominium/CondominiumCard';
import CondominiumDialog from '@/components/condominium/CondominiumDialog';
import CondominiumEmptyState from '@/components/condominium/CondominiumEmptyState';

interface CondominiumManagementProps {
  onSelect: (condominium: Condominium) => void;
  onExportChecklists?: (condominiumId: string) => Promise<void>;
  onDeleteChecklists?: (condominiumId: string) => Promise<void>;
  onDownloadAndDelete?: (condominiumId: string) => Promise<void>;
  isGeneralAdmin?: boolean;
}

const CondominiumManagement = ({ onSelect, onExportChecklists, onDeleteChecklists, onDownloadAndDelete, isGeneralAdmin: propIsGeneralAdmin }: CondominiumManagementProps) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: condominiumLoading, saveCondominium, deleteCondominium } = useCondominiumOperations();
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondominium, setEditingCondominium] = useState<Condominium | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const isGeneralAdmin = propIsGeneralAdmin || user?.email === 'kauankg@hotmail.com';

  // Auto-refresh simples que executa apenas uma vez ao acessar a página
  useEffect(() => {
    const loadCondominiums = async () => {
      if (!user?.id || initialLoadDone) {
        return;
      }

      try {
        console.log('🔄 Carregando condomínios automaticamente...');
        
        let query = supabase.from('condominiums').select('*').order('name');
        
        // Se não for admin geral, filtra apenas os condomínios do usuário
        if (!isGeneralAdmin) {
          query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query;

        if (error) {
          console.error('❌ Erro ao carregar condomínios:', error);
          return;
        }

        console.log('📋 Condomínios carregados:', data.length, 'itens');
        setCondominiums(data);
        setInitialLoadDone(true);
      } catch (error) {
        console.error('❌ Erro ao carregar condomínios:', error);
      }
    };

    if (!authLoading && user?.id) {
      loadCondominiums();
    }
  }, [user?.id, authLoading, isGeneralAdmin, initialLoadDone]);

  const handleRefresh = async () => {
    console.log('🔄 Refresh manual acionado...');
    try {
      let query = supabase.from('condominiums').select('*').order('name');
      
      // Se não for admin geral, filtra apenas os condomínios do usuário
      if (!isGeneralAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro no refresh manual:', error);
        return;
      }

      console.log('📋 Condomínios atualizados:', data.length, 'itens');
      setCondominiums(data);
    } catch (error) {
      console.error('❌ Erro no refresh manual:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    const success = await saveCondominium(values, editingCondominium);
    if (success) {
      setEditingCondominium(null);
      setDialogOpen(false);
      // Recarrega a lista após salvar
      await handleRefresh();
    }
    return success;
  };

  const handleEdit = (condominium: Condominium) => {
    if (!isGeneralAdmin && condominium.user_id !== user?.id) {
      return;
    }
    setEditingCondominium(condominium);
    setDialogOpen(true);
  };

  const handleDelete = async (condominium: Condominium) => {
    const success = await deleteCondominium(condominium);
    if (success) {
      // Recarrega a lista após deletar
      await handleRefresh();
    }
  };

  const handleAddClick = () => {
    setEditingCondominium(null);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCondominium(null);
    }
  };

  const isLoading = authLoading || condominiumLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base">
            {authLoading ? 'Verificando autenticação...' : 'Carregando condomínios...'}
          </p>
        </div>
      </div>
    );
  }

  console.log('🎨 Renderizando CondominiumManagement com', condominiums.length, 'condomínios');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {!isGeneralAdmin && (
          <CondominiumHeader onAddClick={handleAddClick} onRefresh={handleRefresh} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {condominiums.map((condominium) => {
            console.log('🏢 Renderizando card do condomínio:', condominium.name);
            return (
              <CondominiumCard
                key={condominium.id}
                condominium={condominium}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelect={onSelect}
                canEdit={isGeneralAdmin || condominium.user_id === user?.id}
                onExportChecklists={onExportChecklists}
                onDeleteChecklists={onDeleteChecklists}
                onDownloadAndDelete={onDownloadAndDelete}
                showChecklistActions={!!onExportChecklists || !!onDeleteChecklists || !!onDownloadAndDelete}
              />
            );
          })}
          
          {!condominiumLoading && condominiums.length === 0 && (
            <CondominiumEmptyState />
          )}
        </div>

        {!isGeneralAdmin && (
          <CondominiumDialog
            open={dialogOpen}
            onOpenChange={handleDialogChange}
            editingCondominium={editingCondominium}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default CondominiumManagement;
