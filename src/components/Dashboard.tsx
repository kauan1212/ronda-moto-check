import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Bike, CheckSquare, RefreshCw, AlertCircle } from 'lucide-react';
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

const Dashboard = ({ selectedCondominium, onBack }: DashboardProps) => {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const mountedRef = useRef(true);
  const dataFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!selectedCondominium?.id || !mountedRef.current) {
      console.log('Skipping fetch - no condominium or component unmounted');
      return;
    }

    // Prevent multiple concurrent fetches
    if (dataFetchedRef.current && loading) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    console.log('Starting data fetch for condominium:', selectedCondominium.id);
    
    try {
      setLoading(true);
      setError(null);
      dataFetchedRef.current = true;

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

      if (mountedRef.current) {
        setVigilantes(vigilantesResult.data || []);
        setMotorcycles(motorcyclesResult.data || []);
        setChecklists(checklistsResult.data || []);
        setLoading(false);
        setRetryCount(0);
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (mountedRef.current) {
        setError(error.message || 'Erro ao carregar dados');
        setLoading(false);
        toast.error(error.message || 'Erro ao carregar dados');
      }
    } finally {
      dataFetchedRef.current = false;
    }
  }, [selectedCondominium.id]);

  const handleRefresh = useCallback(async () => {
    console.log('Manual refresh triggered from Dashboard...');
    toast.info('Atualizando dados...');
    await fetchData();
    toast.success('Dados atualizados!');
  }, [fetchData]);

  const handleRetry = useCallback(() => {
    console.log('Retrying data fetch...');
    setRetryCount(prev => prev + 1);
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

  // Add timeout fallback for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && mountedRef.current) {
        console.log('Loading timeout reached, showing error');
        setError('Tempo limite excedido ao carregar dados');
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <Layout title={selectedCondominium.name} onBack={onBack} selectedCondominiumId={selectedCondominium.id}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-700">Carregando dados...</div>
          {retryCount > 0 && (
            <div className="text-sm text-gray-500">Tentativa {retryCount}</div>
          )}
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={selectedCondominium.name} onBack={onBack} selectedCondominiumId={selectedCondominium.id}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-lg text-red-600 text-center">Erro: {error}</div>
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={selectedCondominium.name} onBack={onBack} selectedCondominiumId={selectedCondominium.id}>
      <div className="space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Dashboard - {selectedCondominium.name}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Gerencie vigilantes, motocicletas e checklists
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar Dados
            </Button>
          </div>
        </div>

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
