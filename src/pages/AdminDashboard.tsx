
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Bike, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Plus,
  Eye,
  Download,
  UserPlus,
  Settings,
  Trash2,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Motorcycle, Checklist } from '@/types';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'checklists' | 'vigilantes' | 'motos'>('overview');
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newVigilante, setNewVigilante] = useState({ name: '', email: '', registration: '' });
  const [newMotorcycle, setNewMotorcycle] = useState({ brand: '', model: '', year: '', plate: '', color: '' });
  const [isVigilanteDialogOpen, setIsVigilanteDialogOpen] = useState(false);
  const [isMotorcycleDialogOpen, setIsMotorcycleDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vigilantesData, motorcyclesData, checklistsData] = await Promise.all([
        supabase.from('vigilantes').select('*').order('created_at', { ascending: false }),
        supabase.from('motorcycles').select('*').order('created_at', { ascending: false }),
        supabase.from('checklists').select('*').order('created_at', { ascending: false })
      ]);

      if (vigilantesData.data) setVigilantes(vigilantesData.data);
      if (motorcyclesData.data) setMotorcycles(motorcyclesData.data);
      if (checklistsData.data) setChecklists(checklistsData.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyVigilanteLink = () => {
    const link = `${window.location.origin}/vigilante-checklist`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link da plataforma dos vigilantes copiado para a área de transferência.",
    });
  };

  const addVigilante = async () => {
    if (!newVigilante.name || !newVigilante.email || !newVigilante.registration) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('vigilantes')
        .insert([newVigilante]);

      if (error) throw error;

      toast({
        title: "Vigilante adicionado!",
        description: "Vigilante foi cadastrado com sucesso.",
      });

      setNewVigilante({ name: '', email: '', registration: '' });
      setIsVigilanteDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar vigilante:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar vigilante.",
        variant: "destructive",
      });
    }
  };

  const deleteVigilante = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vigilantes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Vigilante removido!",
        description: "Vigilante foi removido com sucesso.",
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao remover vigilante:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover vigilante.",
        variant: "destructive",
      });
    }
  };

  const addMotorcycle = async () => {
    if (!newMotorcycle.brand || !newMotorcycle.model || !newMotorcycle.year || !newMotorcycle.plate || !newMotorcycle.color) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('motorcycles')
        .insert([{
          ...newMotorcycle,
          year: parseInt(newMotorcycle.year)
        }]);

      if (error) throw error;

      toast({
        title: "Motocicleta adicionada!",
        description: "Motocicleta foi cadastrada com sucesso.",
      });

      setNewMotorcycle({ brand: '', model: '', year: '', plate: '', color: '' });
      setIsMotorcycleDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar motocicleta:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar motocicleta.",
        variant: "destructive",
      });
    }
  };

  const deleteMotorcycle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('motorcycles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Motocicleta removida!",
        description: "Motocicleta foi removida com sucesso.",
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao remover motocicleta:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover motocicleta.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Enviado</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case 'available':
        return <Badge className="bg-blue-100 text-blue-800">Disponível</Badge>;
      case 'in_use':
        return <Badge className="bg-orange-100 text-orange-800">Em uso</Badge>;
      case 'maintenance':
        return <Badge className="bg-red-100 text-red-800">Manutenção</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              Painel Administrativo LocAuto
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Gerencie vigilantes, motos e checklists
            </p>
          </div>
          
          <Button onClick={copyVigilanteLink} className="bg-gradient-to-r from-blue-600 to-blue-700">
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link dos Vigilantes
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Settings },
            { id: 'checklists', label: 'Checklists', icon: CheckCircle2 },
            { id: 'vigilantes', label: 'Vigilantes', icon: Users },
            { id: 'motos', label: 'Motocicletas', icon: Bike }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "ghost"}
              onClick={() => setActiveTab(id as any)}
              className="flex-1"
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vigilantes</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vigilantes.length}</div>
                <p className="text-xs text-blue-700">
                  {vigilantes.filter(v => v.status === 'active').length} ativos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Motocicletas</CardTitle>
                <Bike className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{motorcycles.length}</div>
                <p className="text-xs text-green-700">
                  {motorcycles.filter(m => m.status === 'available').length} disponíveis
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Checklists</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{checklists.length}</div>
                <p className="text-xs text-orange-700">
                  {checklists.filter(c => c.status === 'completed').length} concluídos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {checklists.filter(c => 
                    new Date(c.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <p className="text-xs text-purple-700">Checklists de hoje</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Checklists Tab */}
        {activeTab === 'checklists' && (
          <Card>
            <CardHeader>
              <CardTitle>Checklists Realizados</CardTitle>
              <CardDescription>
                Histórico de todos os checklists realizados pelos vigilantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vigilante</TableHead>
                    <TableHead>Moto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklists.map((checklist) => (
                    <TableRow key={checklist.id}>
                      <TableCell className="font-medium">{checklist.vigilante_name}</TableCell>
                      <TableCell>{checklist.motorcycle_plate}</TableCell>
                      <TableCell>
                        {checklist.type === 'start' ? 'Início' : 'Fim'}
                      </TableCell>
                      <TableCell>{getStatusBadge(checklist.status)}</TableCell>
                      <TableCell>{formatDate(checklist.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Vigilantes Tab */}
        {activeTab === 'vigilantes' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Vigilantes</CardTitle>
                <CardDescription>
                  Adicionar, editar ou remover vigilantes do sistema
                </CardDescription>
              </div>
              
              <Dialog open={isVigilanteDialogOpen} onOpenChange={setIsVigilanteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Vigilante
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Vigilante</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo vigilante
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={newVigilante.name}
                        onChange={(e) => setNewVigilante(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do vigilante"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newVigilante.email}
                        onChange={(e) => setNewVigilante(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="registration">Matrícula</Label>
                      <Input
                        id="registration"
                        value={newVigilante.registration}
                        onChange={(e) => setNewVigilante(prev => ({ ...prev, registration: e.target.value }))}
                        placeholder="VIG-001"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsVigilanteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addVigilante}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vigilantes.map((vigilante) => (
                    <TableRow key={vigilante.id}>
                      <TableCell className="font-medium">{vigilante.name}</TableCell>
                      <TableCell>{vigilante.email}</TableCell>
                      <TableCell>{vigilante.registration}</TableCell>
                      <TableCell>{getStatusBadge(vigilante.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteVigilante(vigilante.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Motos Tab */}
        {activeTab === 'motos' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Motocicletas</CardTitle>
                <CardDescription>
                  Adicionar, editar ou remover motocicletas do sistema
                </CardDescription>
              </div>
              
              <Dialog open={isMotorcycleDialogOpen} onOpenChange={setIsMotorcycleDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Moto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Motocicleta</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da nova motocicleta
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                          id="brand"
                          value={newMotorcycle.brand}
                          onChange={(e) => setNewMotorcycle(prev => ({ ...prev, brand: e.target.value }))}
                          placeholder="Honda"
                        />
                      </div>
                      <div>
                        <Label htmlFor="model">Modelo</Label>
                        <Input
                          id="model"
                          value={newMotorcycle.model}
                          onChange={(e) => setNewMotorcycle(prev => ({ ...prev, model: e.target.value }))}
                          placeholder="CG 150"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="year">Ano</Label>
                        <Input
                          id="year"
                          type="number"
                          value={newMotorcycle.year}
                          onChange={(e) => setNewMotorcycle(prev => ({ ...prev, year: e.target.value }))}
                          placeholder="2023"
                        />
                      </div>
                      <div>
                        <Label htmlFor="color">Cor</Label>
                        <Input
                          id="color"
                          value={newMotorcycle.color}
                          onChange={(e) => setNewMotorcycle(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="Vermelha"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="plate">Placa</Label>
                      <Input
                        id="plate"
                        value={newMotorcycle.plate}
                        onChange={(e) => setNewMotorcycle(prev => ({ ...prev, plate: e.target.value }))}
                        placeholder="ABC-1234"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsMotorcycleDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addMotorcycle}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {motorcycles.map((motorcycle) => (
                    <TableRow key={motorcycle.id}>
                      <TableCell className="font-medium">{motorcycle.brand}</TableCell>
                      <TableCell>{motorcycle.model}</TableCell>
                      <TableCell>{motorcycle.year}</TableCell>
                      <TableCell>{motorcycle.plate}</TableCell>
                      <TableCell>{motorcycle.color}</TableCell>
                      <TableCell>{getStatusBadge(motorcycle.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteMotorcycle(motorcycle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
