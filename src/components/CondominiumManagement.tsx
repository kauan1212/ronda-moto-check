
import React, { useState, useEffect, useRef } from 'react';
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
  const { loading: condominiumLoading, fetchCondominiums, refreshCondominiums, saveCondominium, deleteCondominium } = useCondominiumOperations();
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondominium, setEditingCondominium] = useState<Condominium | null>(null);
  const hasInitialized = useRef(false);

  const loadCondominiums = async () => {
    console.log('🔄 Loading condominiums...');
    const data = await fetchCondominiums();
    console.log('📋 Setting condominiums state with:', data.length, 'items');
    setCondominiums(data);
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered...');
    const data = await refreshCondominiums();
    console.log('📋 Refreshed condominiums, setting state with:', data.length, 'items');
    setCondominiums(data);
  };

  // Simplified auto-refresh: Always execute when component mounts and user is authenticated
  useEffect(() => {
    const performAutoRefresh = async () => {
      // Wait for auth to be ready and user to be available
      if (authLoading) {
        console.log('⏳ Auth still loading, waiting...');
        return;
      }

      if (!user?.id) {
        console.log('🚫 No user found, clearing condominiums...');
        setCondominiums([]);
        hasInitialized.current = false;
        return;
      }

      // Execute auto-refresh only once when component mounts with authenticated user
      if (!hasInitialized.current) {
        console.log('✅ Component mounted with authenticated user, triggering auto-refresh');
        hasInitialized.current = true;
        
        // Small delay to ensure everything is ready
        setTimeout(async () => {
          console.log('🔄 Executing automatic refresh...');
          await handleRefresh();
        }, 200);
      }
    };

    performAutoRefresh();
  }, [authLoading, user?.id]);

  // Reset initialization flag when user changes (login/logout)
  useEffect(() => {
    if (!user?.id) {
      hasInitialized.current = false;
    }
  }, [user?.id]);

  // Debug effect: Monitor state changes
  useEffect(() => {
    console.log('📊 State Debug - condominiums.length:', condominiums.length);
    console.log('📊 Current condominiums:', condominiums.map(c => ({ id: c.id, name: c.name })));
  }, [condominiums]);

  const handleSubmit = async (values: any) => {
    const success = await saveCondominium(values, editingCondominium);
    if (success) {
      setEditingCondominium(null);
      setDialogOpen(false);
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

  console.log('🎨 Rendering CondominiumManagement with', condominiums.length, 'condominiums');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <CondominiumHeader onAddClick={handleAddClick} onRefresh={handleRefresh} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {condominiums.map((condominium) => {
            console.log('🏢 Rendering condominium card:', condominium.name);
            return (
              <CondominiumCard
                key={condominium.id}
                condominium={condominium}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelect={onSelect}
              />
            );
          })}
          
          {!condominiumLoading && condominiums.length === 0 && (
            <CondominiumEmptyState />
          )}
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
