
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
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      console.log('Fetching data for condominium:', selectedCondominium.id);
      setError(null);

      // Fetch all data in parallel
      const [vigilantesResult, motorcyclesResult, checklistsResult] = await Promise.all([
        supabase
          .from('vigilantes')
          .select('*')
          .eq('condominium_id', selectedCondominium.id),
        supabase
          .from('motorcycles')
          .select('*')
          .eq('condominium_id', selectedCondominium.id),
        supabase
          .from('checklists')
          .select('*')
          .eq('condominium_id', selectedCondominium.id)
          .order('created_at', { ascending: false })
      ]);

      // Handle vigilantes
      if (vigilantesResult.error) {
        console.error('Error fetching vigilantes:', vigilantesResult.error);
        throw new Error('Erro ao carregar vigilantes');
      }
      setVigilantes(vigilantesResult.data || []);

      // Handle motorcycles
      if (motorcyclesResult.error) {
        console.error('Error fetching motorcycles:', motorcyclesResult.error);
        throw new Error('Erro ao carregar motocicletas');
      }
      setMotorcycles(motorcyclesResult.data || []);

      // Handle checklists
      if (checklistsResult.error) {
        console.error('Error fetching checklists:', checklistsResult.error);
        throw new Error('Erro ao carregar checklists');
      }
      setChecklists(checklistsResult.data || []);

      console.log('Data loaded successfully:', {
        vigilantes: vigilantesResult.data?.length || 0,
        motorcycles: motorcyclesResult.data?.length || 0,
        checklists: checklistsResult.data?.length || 0
      });

    } catch (error: any) {
      console.error('Error in fetchData:', error);
      setError(error.message || 'Erro ao carregar dados');
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCondominium?.id) {
      console.error('No condominium selected');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        setLoading(true);
        await fetchData();
      }
    };

    loadData();

    // Set up real-time subscriptions
    const vigilantesChannel = supabase
      .channel(`vigilantes_${selectedCondominium.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vigilantes',
          filter: `condominium_id=eq.${selectedCondominium.id}`
        },
        () => {
          console.log('Vigilantes changed, refetching...');
          if (isMounted) {
            fetchData();
          }
        }
      )
      .subscribe();

    const motorcyclesChannel = supabase
      .channel(`motorcycles_${selectedCondominium.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'motorcycles',
          filter: `condominium_id=eq.${selectedCondominium.id}`
        },
        () => {
          console.log('Motorcycles changed, refetching...');
          if (isMounted) {
            fetchData();
          }
        }
      )
      .subscribe();

    const checklistsChannel = supabase
      .channel(`checklists_${selectedCondominium.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklists',
          filter: `condominium_id=eq.${selectedCondominium.id}`
        },
        () => {
          console.log('Checklists changed, refetching...');
          if (isMounted) {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(vigilantesChannel);
      supabase.removeChannel(motorcyclesChannel);
      supabase.removeChannel(checklistsChannel);
    };
  }, [selectedCondominium.id]);

  if (loading) {
    return (
      <Layout title={selectedCondominium.name} onBack={onBack}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={selectedCondominium.name} onBack={onBack}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600">Erro: {error}</div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchData();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
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
