
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Bike, CheckSquare, Image } from 'lucide-react';
import CondominiumManagement from '@/components/CondominiumManagement';
import VigilanteManagement from '@/components/VigilanteManagement';
import MotorcycleManagement from '@/components/MotorcycleManagement';
import ChecklistManagement from '@/components/ChecklistManagement';
import LogoManagement from '@/components/LogoManagement';
import CondominiumSelector from '@/components/CondominiumSelector';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Condominium, Vigilante, Motorcycle, Checklist } from '@/types';

const AdminPanel = () => {
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string>('');

  const { data: condominiums = [], isLoading: condominiumsLoading, refetch: refetchCondominiums } = useQuery({
    queryKey: ['condominiums'],
    queryFn: async () => {
      console.log('Fetching condominiums...');
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
    setSelectedCondominiumId(condominium.id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      </div>

      <CondominiumSelector
        condominiums={condominiums}
        selectedId={selectedCondominiumId}
        onSelect={handleCondominiumSelect}
        loading={condominiumsLoading}
      />

      <Tabs defaultValue="condominiums" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="condominiums" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Condomínios
          </TabsTrigger>
          <TabsTrigger value="vigilantes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vigilantes
          </TabsTrigger>
          <TabsTrigger value="motorcycles" className="flex items-center gap-2">
            <Bike className="h-4 w-4" />
            Motocicletas
          </TabsTrigger>
          <TabsTrigger value="checklists" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Logo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="condominiums" className="space-y-6">
          <CondominiumManagement onSelect={handleCondominiumSelect} />
        </TabsContent>

        <TabsContent value="vigilantes" className="space-y-6">
          {selectedCondominium ? (
            <VigilanteManagement 
              condominium={selectedCondominium}
              vigilantes={vigilantes}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Selecione um condomínio para gerenciar vigilantes
            </div>
          )}
        </TabsContent>

        <TabsContent value="motorcycles" className="space-y-6">
          {selectedCondominium ? (
            <MotorcycleManagement 
              condominium={selectedCondominium}
              motorcycles={motorcycles}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Selecione um condomínio para gerenciar motocicletas
            </div>
          )}
        </TabsContent>

        <TabsContent value="checklists" className="space-y-6">
          {selectedCondominium ? (
            <ChecklistManagement 
              condominium={selectedCondominium}
              checklists={checklists}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Selecione um condomínio para visualizar checklists
            </div>
          )}
        </TabsContent>

        <TabsContent value="logo" className="space-y-6">
          <LogoManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
