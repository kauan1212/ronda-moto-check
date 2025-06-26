
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Bike, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Condominium, Vigilante, Motorcycle, Checklist } from '@/types';
import { toast } from 'sonner';
import Layout from './Layout';
import VigilanteManagement from './VigilanteManagement';
import MotorcycleManagement from './MotorcycleManagement';
import ChecklistManagement from './ChecklistManagement';

interface DashboardProps {
  selectedCondominium: Condominium;
  onBack: () => void;
}

const Dashboard = ({ selectedCondominium, onBack }: DashboardProps) => {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log('Starting fetchData for condominium:', selectedCondominium.id);
      setLoading(true);

      // Fetch vigilantes
      console.log('Fetching vigilantes...');
      const { data: vigilantesData, error: vigilantesError } = await supabase
        .from('vigilantes')
        .select('*')
        .eq('condominium_id', selectedCondominium.id);

      if (vigilantesError) {
        console.error('Error fetching vigilantes:', vigilantesError);
        toast.error('Erro ao carregar vigilantes');
      } else {
        console.log('Vigilantes fetched:', vigilantesData?.length || 0);
        setVigilantes(vigilantesData || []);
      }

      // Fetch motorcycles
      console.log('Fetching motorcycles...');
      const { data: motorcyclesData, error: motorcyclesError } = await supabase
        .from('motorcycles')
        .select('*')
        .eq('condominium_id', selectedCondominium.id);

      if (motorcyclesError) {
        console.error('Error fetching motorcycles:', motorcyclesError);
        toast.error('Erro ao carregar motocicletas');
      } else {
        console.log('Motorcycles fetched:', motorcyclesData?.length || 0);
        setMotorcycles(motorcyclesData || []);
      }

      // Fetch checklists
      console.log('Fetching checklists...');
      const { data: checklistsData, error: checklistsError } = await supabase
        .from('checklists')
        .select('*')
        .eq('condominium_id', selectedCondominium.id)
        .order('created_at', { ascending: false });

      if (checklistsError) {
        console.error('Error fetching checklists:', checklistsError);
        toast.error('Erro ao carregar checklists');
      } else {
        console.log('Checklists fetched:', checklistsData?.length || 0);
        setChecklists(checklistsData || []);
      }

      console.log('All data fetched successfully');
    } catch (error: any) {
      console.error('Unexpected error in fetchData:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCondominium?.id) {
      console.log('useEffect triggered for condominium:', selectedCondominium.id);
      fetchData();

      // Set up real-time subscriptions for data sync across devices
      const vigilantesChannel = supabase
        .channel('vigilantes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vigilantes',
            filter: `condominium_id=eq.${selectedCondominium.id}`
          },
          () => {
            console.log('Vigilantes changed, refetching data');
            fetchData(); // Refetch data when changes occur
          }
        )
        .subscribe();

      const motorcyclesChannel = supabase
        .channel('motorcycles_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'motorcycles',
            filter: `condominium_id=eq.${selectedCondominium.id}`
          },
          () => {
            console.log('Motorcycles changed, refetching data');
            fetchData(); // Refetch data when changes occur
          }
        )
        .subscribe();

      const checklistsChannel = supabase
        .channel('checklists_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'checklists',
            filter: `condominium_id=eq.${selectedCondominium.id}`
          },
          () => {
            console.log('Checklists changed, refetching data');
            fetchData(); // Refetch data when changes occur
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        console.log('Cleaning up subscriptions');
        supabase.removeChannel(vigilantesChannel);
        supabase.removeChannel(motorcyclesChannel);
        supabase.removeChannel(checklistsChannel);
      };
    }
  }, [selectedCondominium?.id]);

  console.log('Dashboard render - loading:', loading, 'condominium:', selectedCondominium?.name);

  if (loading) {
    return (
      <Layout title={selectedCondominium.name} onBack={onBack}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={selectedCondominium.name} onBack={onBack}>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vigilantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vigilantes.length}</div>
              <p className="text-xs text-muted-foreground">
                {vigilantes.filter(v => v.status === 'active').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Motocicletas</CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{motorcycles.length}</div>
              <p className="text-xs text-muted-foreground">
                {motorcycles.filter(m => m.status === 'available').length} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checklists Realizados</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checklists.length}</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="vigilantes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>
          
          <TabsContent value="vigilantes" className="mt-6">
            <VigilanteManagement 
              condominium={selectedCondominium} 
              vigilantes={vigilantes}
              onUpdate={fetchData}
            />
          </TabsContent>
          
          <TabsContent value="motorcycles" className="mt-6">
            <MotorcycleManagement 
              condominium={selectedCondominium} 
              motorcycles={motorcycles}
              onUpdate={fetchData}
            />
          </TabsContent>

          <TabsContent value="checklists" className="mt-6">
            <ChecklistManagement 
              condominium={selectedCondominium} 
              checklists={checklists}
              onUpdate={fetchData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
