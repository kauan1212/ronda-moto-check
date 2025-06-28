import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2, Users, Car, CheckSquare, Image, UserCog, ArrowLeft } from 'lucide-react';
import CondominiumManagement from '@/components/CondominiumManagement';
import VigilanteManagement from '@/components/VigilanteManagement';
import MotorcycleManagement from '@/components/MotorcycleManagement';
import ChecklistManagement from '@/components/ChecklistManagement';
import LogoManagement from '@/components/LogoManagement';
import UserManagement from '@/components/UserManagement';
import CondominiumSelector from '@/components/CondominiumSelector';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Condominium, Vigilante, Motorcycle, Checklist } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string>('');

  const isGeneralAdmin = user?.email === 'kauankg@hotmail.com';
  const isSuperAdmin = user?.email === 'kauankg@hotmail.com';

  // Query para condomínios - admin geral vê todos, usuários normais veem apenas os seus
  const { data: condominiums = [], isLoading: condominiumsLoading, refetch: refetchCondominiums } = useQuery({
    queryKey: ['condominiums', user?.id, isGeneralAdmin],
    queryFn: async () => {
      if (!user?.id) {
        console.log('AdminPanel: No user found, skipping condominiums fetch');
        return [];
      }
      
      console.log('AdminPanel: Fetching condominiums for user:', user.id, 'isGeneralAdmin:', isGeneralAdmin);
      
      let query = supabase.from('condominiums').select('*').order('name');
      
      // Se não for admin geral, filtra apenas os condomínios do usuário
      if (!isGeneralAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('AdminPanel: Error fetching condominiums:', error);
        throw error;
      }
      
      console.log('AdminPanel: Fetched condominiums:', data?.length);
      return data as Condominium[];
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Force refetch when user changes
  useEffect(() => {
    if (user?.id && !authLoading) {
      console.log('AdminPanel: User changed, refetching condominiums for:', user.id);
      refetchCondominiums();
    }
  }, [user?.id, authLoading, refetchCondominiums]);

  const { data: vigilantes = [], refetch: refetchVigilantes } = useQuery({
    queryKey: ['vigilantes', selectedCondominiumId],
    queryFn: async () => {
      if (!selectedCondominiumId) return [];
      
      const { data, error } = await supabase
        .from('vigilantes')
        .select('*')
        .eq('condominium_id', selectedCondominiumId)
        .order('name');
      
      if (error) throw error;
      return data as Vigilante[];
    },
    enabled: !!selectedCondominiumId
  });

  const { data: motorcycles = [], refetch: refetchMotorcycles } = useQuery({
    queryKey: ['motorcycles', selectedCondominiumId],
    queryFn: async () => {
      if (!selectedCondominiumId) return [];
      
      const { data, error } = await supabase
        .from('motorcycles')
        .select('*')
        .eq('condominium_id', selectedCondominiumId)
        .order('plate');
      
      if (error) throw error;
      return data as Motorcycle[];
    },
    enabled: !!selectedCondominiumId
  });

  const { data: checklists = [], refetch: refetchChecklists } = useQuery({
    queryKey: ['checklists', selectedCondominiumId],
    queryFn: async () => {
      if (!selectedCondominiumId) return [];
      
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('condominium_id', selectedCondominiumId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Checklist[];
    },
    enabled: !!selectedCondominiumId
  });

  const selectedCondominium = condominiums.find(c => c.id === selectedCondominiumId);

  const handleUpdate = () => {
    refetchVigilantes();
    refetchMotorcycles();
    refetchChecklists();
  };

  const handleCondominiumSelect = (condominium: Condominium) => {
    // Admin geral pode selecionar qualquer condomínio
    if (!isGeneralAdmin && condominium.user_id !== user?.id) {
      console.warn('AdminPanel: Attempted to select condominium not owned by user');
      return;
    }
    console.log('AdminPanel: Selected condominium:', condominium.name);
    setSelectedCondominiumId(condominium.id);
  };

  const handleBack = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/';
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {isGeneralAdmin && (
            <Button 
              onClick={handleBack}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isGeneralAdmin ? 'Painel Administrativo Geral' : 'Painel Administrativo'}
          </h1>
        </div>
      </div>

      <CondominiumSelector
        condominiums={condominiums}
        selectedId={selectedCondominiumId}
        onSelect={handleCondominiumSelect}
        loading={condominiumsLoading || authLoading}
      />

      <Tabs defaultValue="condominiums" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className={`grid w-full ${isGeneralAdmin ? (isSuperAdmin ? 'grid-cols-4' : 'grid-cols-3') : 'grid-cols-6'} min-w-max gap-1`}>
            <TabsTrigger value="condominiums" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Condomínios</span>
              <span className="sm:hidden">Cond.</span>
            </TabsTrigger>
            
            {/* Aba de usuários apenas para super admin */}
            {isSuperAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                <UserCog className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Usuários</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
            )}
            
            {!isGeneralAdmin && (
              <>
                <TabsTrigger value="vigilantes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Vigilantes</span>
                  <span className="sm:hidden">Vigil.</span>
                </TabsTrigger>
                <TabsTrigger value="motorcycles" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                  <Car className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Veículos</span>
                  <span className="sm:hidden">Veíc.</span>
                </TabsTrigger>
              </>
            )}
            
            <TabsTrigger value="checklists" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
              <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Checklists</span>
              <span className="sm:hidden">Check.</span>
            </TabsTrigger>
            
            <TabsTrigger value="logo" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
              <Image className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              Logo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="condominiums" className="space-y-4 sm:space-y-6">
          <CondominiumManagement onSelect={handleCondominiumSelect} />
        </TabsContent>

        {/* Tab de usuários apenas para super admin */}
        {isSuperAdmin && (
          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <UserManagement />
          </TabsContent>
        )}

        {!isGeneralAdmin && (
          <>
            <TabsContent value="vigilantes" className="space-y-4 sm:space-y-6">
              {selectedCondominium ? (
                <VigilanteManagement 
                  condominium={selectedCondominium}
                  vigilantes={vigilantes}
                  onUpdate={handleUpdate}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm sm:text-base px-4">
                  Selecione um condomínio para gerenciar vigilantes
                </div>
              )}
            </TabsContent>

            <TabsContent value="motorcycles" className="space-y-4 sm:space-y-6">
              {selectedCondominium ? (
                <MotorcycleManagement 
                  condominium={selectedCondominium}
                  motorcycles={motorcycles}
                  onUpdate={handleUpdate}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm sm:text-base px-4">
                  Selecione um condomínio para gerenciar veículos
                </div>
              )}
            </TabsContent>
          </>
        )}

        <TabsContent value="checklists" className="space-y-4 sm:space-y-6">
          {selectedCondominium ? (
            <ChecklistManagement 
              condominium={selectedCondominium}
              checklists={checklists}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm sm:text-base px-4">
              Selecione um condomínio para visualizar checklists
            </div>
          )}
        </TabsContent>

        <TabsContent value="logo" className="space-y-4 sm:space-y-6">
          <LogoManagement isGeneralAdmin={isGeneralAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
