
import React, { useState, useEffect } from 'react';
import { Condominium } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCondominiumOperations } from '@/hooks/useCondominiumOperations';
import CondominiumHeader from '@/components/condominium/CondominiumHeader';
import CondominiumCard from '@/components/condominium/CondominiumCard';
import CondominiumDialog from '@/components/condominium/CondominiumDialog';
import CondominiumEmptyState from '@/components/condominium/CondominiumEmptyState';

interface CondominiumManagementProps {
  onSelect: (condominium: Condominium) => void;
}

const CondominiumManagement = ({ onSelect }: CondominiumManagementProps) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: condominiumLoading, fetchCondominiums, saveCondominium, deleteCondominium } = useCondominiumOperations();
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondominium, setEditingCondominium] = useState<Condominium | null>(null);

  const loadCondominiums = async () => {
    console.log('Loading condominiums...');
    const data = await fetchCondominiums();
    console.log('Loaded condominiums:', data.length);
    setCondominiums(data);
  };

  // Aguardar auth carregar completamente antes de buscar dados
  useEffect(() => {
    console.log('CondominiumManagement useEffect triggered, authLoading:', authLoading, 'user:', user?.id);
    
    // Só buscar dados quando auth não estiver carregando
    if (!authLoading) {
      if (user?.id) {
        console.log('Auth loaded, fetching condominiums for user:', user.id);
        loadCondominiums();
      } else {
        console.log('No user after auth loading, clearing condominiums');
        setCondominiums([]);
      }
    }
  }, [authLoading, user?.id]); // Incluir authLoading nas dependências

  const handleSubmit = async (values: any) => {
    const success = await saveCondominium(values, editingCondominium);
    if (success) {
      setEditingCondominium(null);
      setDialogOpen(false);
      // Recarregar a lista após salvar
      await loadCondominiums();
    }
    return success;
  };

  const handleEdit = (condominium: Condominium) => {
    if (condominium.user_id !== user?.id) {
      return;
    }
    setEditingCondominium(condominium);
    setDialogOpen(true);
  };

  const handleDelete = async (condominium: Condominium) => {
    const success = await deleteCondominium(condominium);
    if (success) {
      // Recarregar a lista após deletar
      await loadCondominiums();
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

  // Mostrar loading enquanto auth ou condominiums estão carregando
  if (authLoading || condominiumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base">
            {authLoading ? 'Carregando autenticação...' : 'Carregando condomínios...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <CondominiumHeader onAddClick={handleAddClick} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {condominiums.map((condominium) => (
            <CondominiumCard
              key={condominium.id}
              condominium={condominium}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={onSelect}
            />
          ))}
          
          {condominiums.length === 0 && <CondominiumEmptyState />}
        </div>

        <CondominiumDialog
          open={dialogOpen}
          onOpenChange={handleDialogChange}
          editingCondominium={editingCondominium}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default CondominiumManagement;
