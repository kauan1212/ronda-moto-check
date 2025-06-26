
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Car, CheckSquare, Image, UserCog } from 'lucide-react';
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

const AdminPanel = () => {
  const { user } = useAuth();
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string>('');

  const { data: condominiums = [], isLoading: condominiumsLoading, refetch: refetchCondominiums } = useQuery({
    queryKey: ['condominiums', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user found, skipping condominiums fetch');
        return [];
      }
      
      console.log('Fetching condominiums for user:', user.id);
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .eq('user_id', user.id) // Garantir filtro por user_id
        .order('name');
      
      if (error) {
        console.error('Error fetching condominiums:', error);
        throw error;
      }
      
      console.log('Fetched condominiums:', data?.length);
      return data as Condominium[];
    },
    enabled: !!user?.id, // Mudança importante: dependência mais específica
    staleTime: 0, // Garante que os dados sejam sempre atualizados
    refetchOnMount: true // Garante refetch ao montar o componente
  });

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
    // Verificar se o condomínio pertence ao usuário atual
    if (condominium.user_id !== user?.id) {
      console.warn('Attempted to select condominium not owned by user');
      return;
    }
    setSelectedCondominiumId(condominium.id);
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Painel Administrativo</h1>
      </div>

      <CondominiumSelector
        condominiums={condominiums}
        selectedId={selectedCondominiumId}
        onSelect={handleCondominiumSelect}
        loading={condominiumsLoading}
      />

      <Tabs defaultValue="condominiums" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-6 min-w-max">
            <TabsTrigger value="condominiums" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Condomínios</span>
              <span className="sm:hidden">Cond.</span>
            </TabsTrigger>
            <TabsTrigger value="vigilantes" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Vigilantes</span>
              <span className="sm:hidden">Vigil.</span>
            </TabsTrigger>
            <TabsTrigger value="motorcycles" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Car className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Veículos</span>
              <span className="sm:hidden">Veíc.</span>
            </TabsTrigger>
            <TabsTrigger value="checklists" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Checklists</span>
              <span className="sm:hidden">Check.</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <UserCog className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Usuários</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Image className="h-3 w-3 sm:h-4 sm:w-4" />
              Logo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="condominiums" className="space-y-4 sm:space-y-6">
          <CondominiumManagement onSelect={handleCondominiumSelect} />
        </TabsContent>

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

        <TabsContent value="users" className="space-y-4 sm:space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="logo" className="space-y-4 sm:space-y-6">
          <LogoManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
