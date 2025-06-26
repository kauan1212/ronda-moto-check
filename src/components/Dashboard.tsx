
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Bike, CheckSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface DashboardState {
  vigilantes: Vigilante[];
  motorcycles: Motorcycle[];
  checklists: Checklist[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const Dashboard = ({ selectedCondominium, onBack }: DashboardProps) => {
  const [state, setState] = useState<DashboardState>({
    vigilantes: [],
    motorcycles: [],
    checklists: [],
    loading: true,
    error: null,
    initialized: false,
  });

  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);

  const setLoading = useCallback((loading: boolean) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, loading }));
      isLoadingRef.current = loading;
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, error, loading: false }));
      isLoadingRef.current = false;
    }
  }, []);

  const setData = useCallback((data: Partial<Pick<DashboardState, 'vigilantes' | 'motorcycles' | 'checklists'>>) => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        ...data,
        loading: false,
        error: null,
        initialized: true,
      }));
      isLoadingRef.current = false;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedCondominium?.id || isLoadingRef.current) {
      console.log('Skipping fetch - no condominium or already loading');
      return;
    }

    console.log('Starting data fetch for condominium:', selectedCondominium.id);
    setLoading(true);
    setError(null);

    try {
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

      if (!mountedRef.current) return;

      // Check for errors
      if (vigilantesResult.error) {
        throw new Error(`Erro ao carregar vigilantes: ${vigilantesResult.error.message}`);
      }
      if (motorcyclesResult.error) {
        throw new Error(`Erro ao carregar motocicletas: ${motorcyclesResult.error.message}`);
      }
      if (checklistsResult.error) {
        throw new Error(`Erro ao carregar checklists: ${checklistsResult.error.message}`);
      }

      console.log('Data fetched successfully:', {
        vigilantes: vigilantesResult.data?.length || 0,
        motorcycles: motorcyclesResult.data?.length || 0,
        checklists: checklistsResult.data?.length || 0
      });

      setData({
        vigilantes: vigilantesResult.data || [],
        motorcycles: motorcyclesResult.data || [],
        checklists: checklistsResult.data || []
      });

    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (mountedRef.current) {
        setError(error.message || 'Erro ao carregar dados');
        toast.error(error.message || 'Erro ao carregar dados');
      }
    }
  }, [selectedCondominium.id, setLoading, setError, setData]);

  const handleRetry = useCallback(() => {
    console.log('Retrying data fetch...');
    fetchData();
  }, [fetchData]);

  // Initial data load
  useEffect(() => {
    console.log('Dashboard mounted, initializing data fetch');
    fetchData();

    return () => {
      console.log('Dashboard unmounting');
      mountedRef.current = false;
    };
  }, [fetchData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!selectedCondominium?.id || !state.initialized) {
      return;
    }

    console.log('Setting up real-time subscriptions');

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
          if (!isLoadingRef.current) {
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
          if (!isLoadingRef.current) {
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
          if (!isLoadingRef.current) {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(vigilantesChannel);
      supabase.removeChannel(motorcyclesChannel);
      supabase.removeChannel(checklistsChannel);
    };
  }, [selectedCondominium.id, state.initialized, fetchData]);

  if (state.loading && !state.initialized) {
    return (
      <Layout title={selectedCondominium.name} onBack={onBack}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <div className="text-lg">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  if (state.error) {
    return (
      <Layout title={selectedCondominium.name} onBack={onBack}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600">Erro: {state.error}</div>
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
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
              <div className="text-2xl font-bold">{state.vigilantes.length}</div>
              <p className="text-xs text-muted-foreground">
                {state.vigilantes.filter(v => v.status === 'active').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Motocicletas</CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.motorcycles.length}</div>
              <p className="text-xs text-muted-foreground">
                {state.motorcycles.filter(m => m.status === 'available').length} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checklists Realizados</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.checklists.length}</div>
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
              vigilantes={state.vigilantes}
              onUpdate={fetchData}
            />
          </TabsContent>
          
          <TabsContent value="motorcycles" className="mt-6">
            <MotorcycleManagement 
              condominium={selectedCondominium} 
              motorcycles={state.motorcycles}
              onUpdate={fetchData}
            />
          </TabsContent>

          <TabsContent value="checklists" className="mt-6">
            <ChecklistManagement 
              condominium={selectedCondominium} 
              checklists={state.checklists}
              onUpdate={fetchData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
