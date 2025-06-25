
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Bike, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Condominium, Vigilante, Motorcycle, Checklist } from '@/types';
import { toast } from 'sonner';
import VigilanteManagement from './VigilanteManagement';
import MotorcycleManagement from './MotorcycleManagement';

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
      console.log('Fetching data for condominium:', selectedCondominium.id);
      setLoading(true);

      // Fetch vigilantes
      const { data: vigilantesData, error: vigilantesError } = await supabase
        .from('vigilantes')
        .select('*')
        .eq('condominium_id', selectedCondominium.id);

      if (vigilantesError) {
        console.error('Error fetching vigilantes:', vigilantesError);
        toast.error('Erro ao carregar vigilantes: ' + vigilantesError.message);
      } else {
        console.log('Vigilantes fetched:', vigilantesData);
        setVigilantes(vigilantesData || []);
      }

      // Fetch motorcycles
      const { data: motorcyclesData, error: motorcyclesError } = await supabase
        .from('motorcycles')
        .select('*')
        .eq('condominium_id', selectedCondominium.id);

      if (motorcyclesError) {
        console.error('Error fetching motorcycles:', motorcyclesError);
        toast.error('Erro ao carregar motocicletas: ' + motorcyclesError.message);
      } else {
        console.log('Motorcycles fetched:', motorcyclesData);
        setMotorcycles(motorcyclesData || []);
      }

      // Fetch checklists
      const { data: checklistsData, error: checklistsError } = await supabase
        .from('checklists')
        .select('*')
        .eq('condominium_id', selectedCondominium.id)
        .order('created_at', { ascending: false });

      if (checklistsError) {
        console.error('Error fetching checklists:', checklistsError);
        toast.error('Erro ao carregar checklists: ' + checklistsError.message);
      } else {
        console.log('Checklists fetched:', checklistsData);
        setChecklists(checklistsData || []);
      }

    } catch (error: any) {
      console.error('Error in fetchData:', error);
      toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCondominium?.id) {
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
          (payload) => {
            console.log('Vigilantes real-time change:', payload);
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
          (payload) => {
            console.log('Motorcycles real-time change:', payload);
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
          (payload) => {
            console.log('Checklists real-time change:', payload);
            fetchData(); // Refetch data when changes occur
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(vigilantesChannel);
        supabase.removeChannel(motorcyclesChannel);
        supabase.removeChannel(checklistsChannel);
      };
    }
  }, [selectedCondominium?.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dados...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{selectedCondominium.name}</h1>
          <p className="text-gray-600">Painel de Controle</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

      {/* Management Components */}
      <div className="space-y-6">
        <VigilanteManagement 
          condominium={selectedCondominium} 
          vigilantes={vigilantes}
          onUpdate={fetchData}
        />
        
        <MotorcycleManagement 
          condominium={selectedCondominium} 
          motorcycles={motorcycles}
          onUpdate={fetchData}
        />
      </div>
    </div>
  );
};

export default Dashboard;
