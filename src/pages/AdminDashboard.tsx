
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'checklists' | 'vigilantes' | 'motos'>('overview');

  const mockChecklists = [
    {
      id: '1',
      vigilanteName: 'João Silva',
      motorcyclePlate: 'ABC-1234',
      type: 'start',
      status: 'completed',
      createdAt: '2024-06-25 08:00:00'
    },
    {
      id: '2',
      vigilanteName: 'Maria Santos',
      motorcyclePlate: 'DEF-5678',
      type: 'end',
      status: 'pending',
      createdAt: '2024-06-25 07:30:00'
    }
  ];

  const mockVigilantes = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@condominio.com',
      registration: 'VIG-001',
      status: 'active'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@condominio.com',
      registration: 'VIG-002',
      status: 'active'
    }
  ];

  const mockMotos = [
    {
      id: '1',
      brand: 'Honda',
      model: 'CG 150',
      plate: 'ABC-1234',
      status: 'available'
    },
    {
      id: '2',
      brand: 'Yamaha',
      model: 'Factor 125',
      plate: 'DEF-5678',
      status: 'in_use'
    }
  ];

  const copyVigilanteLink = () => {
    const link = `${window.location.origin}/vigilante`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link da plataforma dos vigilantes copiado para a área de transferência.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'available':
        return <Badge className="bg-blue-100 text-blue-800">Disponível</Badge>;
      case 'in_use':
        return <Badge className="bg-orange-100 text-orange-800">Em uso</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              Painel Administrativo
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
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-blue-700">2 ativos no momento</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Motocicletas</CardTitle>
                <Bike className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-green-700">6 disponíveis</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Checklists Hoje</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-orange-700">3 pendentes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rondas Ativas</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-purple-700">Em andamento</p>
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
                  {mockChecklists.map((checklist) => (
                    <TableRow key={checklist.id}>
                      <TableCell className="font-medium">{checklist.vigilanteName}</TableCell>
                      <TableCell>{checklist.motorcyclePlate}</TableCell>
                      <TableCell>
                        {checklist.type === 'start' ? 'Início' : 'Fim'}
                      </TableCell>
                      <TableCell>{getStatusBadge(checklist.status)}</TableCell>
                      <TableCell>{checklist.createdAt}</TableCell>
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
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Vigilante
              </Button>
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
                  {mockVigilantes.map((vigilante) => (
                    <TableRow key={vigilante.id}>
                      <TableCell className="font-medium">{vigilante.name}</TableCell>
                      <TableCell>{vigilante.email}</TableCell>
                      <TableCell>{vigilante.registration}</TableCell>
                      <TableCell>{getStatusBadge(vigilante.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Editar</Button>
                          <Button size="sm" variant="destructive">Excluir</Button>
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Moto
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMotos.map((moto) => (
                    <TableRow key={moto.id}>
                      <TableCell className="font-medium">{moto.brand}</TableCell>
                      <TableCell>{moto.model}</TableCell>
                      <TableCell>{moto.plate}</TableCell>
                      <TableCell>{getStatusBadge(moto.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Editar</Button>
                          <Button size="sm" variant="destructive">Excluir</Button>
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
