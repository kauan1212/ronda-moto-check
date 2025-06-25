
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Bike, ClipboardCheck, AlertTriangle, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Motorcycle, Checklist, Condominium } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Layout from './Layout';

interface DashboardProps {
  selectedCondominium: Condominium;
  onBack: () => void;
}

const Dashboard = ({ selectedCondominium, onBack }: DashboardProps) => {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCondominium.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [vigilantesResponse, motorcyclesResponse, checklistsResponse] = await Promise.all([
        supabase.from('vigilantes').select('*').eq('condominium_id', selectedCondominium.id),
        supabase.from('motorcycles').select('*').eq('condominium_id', selectedCondominium.id),
        supabase.from('checklists').select('*').eq('condominium_id', selectedCondominium.id).order('created_at', { ascending: false })
      ]);

      if (vigilantesResponse.error) throw vigilantesResponse.error;
      if (motorcyclesResponse.error) throw motorcyclesResponse.error;
      if (checklistsResponse.error) throw checklistsResponse.error;

      setVigilantes(vigilantesResponse.data || []);
      setMotorcycles(motorcyclesResponse.data || []);
      setChecklists(checklistsResponse.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const downloadChecklistPDF = async (checklist: Checklist) => {
    try {
      // Criar conteúdo HTML para PDF
      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Checklist de Vistoria - ${checklist.motorcycle_plate}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .item { margin-bottom: 15px; padding: 10px; border-left: 4px solid #007bff; background: #f8f9fa; }
              .status-good { border-left-color: #28a745; }
              .status-regular { border-left-color: #ffc107; }
              .status-repair { border-left-color: #dc3545; }
              .signature { margin-top: 50px; text-align: center; }
              img { max-width: 200px; margin: 10px; }
              h1, h2 { color: #333; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Vistoria</h1>
              <h2>${selectedCondominium.name}</h2>
              <p><strong>Motocicleta:</strong> ${checklist.motorcycle_plate}</p>
              <p><strong>Vigilante:</strong> ${checklist.vigilante_name}</p>
              <p><strong>Tipo:</strong> ${checklist.type === 'start' ? 'Início do Turno' : 'Fim do Turno'}</p>
              <p><strong>Data:</strong> ${format(new Date(checklist.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>

            <div class="info-grid">
              <div>
                <h3>Informações da Vistoria</h3>
                <p><strong>Quilometragem:</strong> ${checklist.motorcycle_km || 'Não informado'}</p>
                <p><strong>Nível de Combustível:</strong> ${checklist.fuel_level || 0}%</p>
              </div>
              <div>
                <h3>Status Geral</h3>
                <p><strong>Status:</strong> ${checklist.status}</p>
                <p><strong>Concluído em:</strong> ${checklist.completed_at ? format(new Date(checklist.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Não concluído'}</p>
              </div>
            </div>

            <div class="section">
              <h3>Itens Verificados</h3>
              
              ${checklist.tires_status ? `
                <div class="item status-${checklist.tires_status === 'good' ? 'good' : checklist.tires_status === 'regular' ? 'regular' : 'repair'}">
                  <strong>Pneus:</strong> ${checklist.tires_status === 'good' ? 'Bom' : checklist.tires_status === 'regular' ? 'Regular' : 'Precisa Reparo'}
                  ${checklist.tires_observation ? `<br><em>Observação: ${checklist.tires_observation}</em>` : ''}
                </div>
              ` : ''}

              ${checklist.brakes_status ? `
                <div class="item status-${checklist.brakes_status === 'good' ? 'good' : checklist.brakes_status === 'regular' ? 'regular' : 'repair'}">
                  <strong>Freios:</strong> ${checklist.brakes_status === 'good' ? 'Bom' : checklist.brakes_status === 'regular' ? 'Regular' : 'Precisa Reparo'}
                  ${checklist.brakes_observation ? `<br><em>Observação: ${checklist.brakes_observation}</em>` : ''}
                </div>
              ` : ''}

              ${checklist.engine_oil_status ? `
                <div class="item status-${checklist.engine_oil_status === 'good' ? 'good' : checklist.engine_oil_status === 'regular' ? 'regular' : 'repair'}">
                  <strong>Óleo do Motor:</strong> ${checklist.engine_oil_status === 'good' ? 'Bom' : checklist.engine_oil_status === 'regular' ? 'Regular' : 'Precisa Reparo'}
                  ${checklist.engine_oil_observation ? `<br><em>Observação: ${checklist.engine_oil_observation}</em>` : ''}
                </div>
              ` : ''}

              ${checklist.lights_status ? `
                <div class="item status-${checklist.lights_status === 'good' ? 'good' : checklist.lights_status === 'regular' ? 'regular' : 'repair'}">
                  <strong>Luzes:</strong> ${checklist.lights_status === 'good' ? 'Bom' : checklist.lights_status === 'regular' ? 'Regular' : 'Precisa Reparo'}
                  ${checklist.lights_observation ? `<br><em>Observação: ${checklist.lights_observation}</em>` : ''}
                </div>
              ` : ''}

              ${checklist.electrical_status ? `
                <div class="item status-${checklist.electrical_status === 'good' ? 'good' : checklist.electrical_status === 'regular' ? 'regular' : 'repair'}">
                  <strong>Sistema Elétrico:</strong> ${checklist.electrical_status === 'good' ? 'Bom' : checklist.electrical_status === 'regular' ? 'Regular' : 'Precisa Reparo'}
                  ${checklist.electrical_observation ? `<br><em>Observação: ${checklist.electrical_observation}</em>` : ''}
                </div>
              ` : ''}
            </div>

            ${checklist.general_observations ? `
              <div class="section">
                <h3>Observações Gerais</h3>
                <p>${checklist.general_observations}</p>
              </div>
            ` : ''}

            ${checklist.damages ? `
              <div class="section">
                <h3>Danos Reportados</h3>
                <p>${checklist.damages}</p>
              </div>
            ` : ''}

            ${checklist.signature ? `
              <div class="signature">
                <h3>Assinatura do Vigilante</h3>
                <img src="${checklist.signature}" alt="Assinatura" />
              </div>
            ` : ''}
          </body>
        </html>
      `;

      // Criar blob e fazer download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `checklist-${checklist.motorcycle_plate}-${format(new Date(checklist.created_at), 'dd-MM-yyyy-HH-mm')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Relatório baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  const viewChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
  };

  if (loading) {
    return (
      <Layout title={selectedCondominium.name} onBack={onBack}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (selectedChecklist) {
    return (
      <Layout title={`Checklist - ${selectedChecklist.motorcycle_plate}`} onBack={() => setSelectedChecklist(null)}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Detalhes do Checklist</CardTitle>
                  <CardDescription>
                    {selectedChecklist.vigilante_name} - {selectedChecklist.motorcycle_plate}
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => downloadChecklistPDF(selectedChecklist)}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Tipo:</strong> {selectedChecklist.type === 'start' ? 'Início do Turno' : 'Fim do Turno'}
                </div>
                <div>
                  <strong>Data:</strong> {format(new Date(selectedChecklist.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
                <div>
                  <strong>Quilometragem:</strong> {selectedChecklist.motorcycle_km || 'Não informado'}
                </div>
                <div>
                  <strong>Combustível:</strong> {selectedChecklist.fuel_level || 0}%
                </div>
                <div>
                  <strong>Status:</strong> <Badge>{selectedChecklist.status}</Badge>
                </div>
              </div>

              {/* Itens de verificação */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Itens Verificados</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Pneus', status: selectedChecklist.tires_status, obs: selectedChecklist.tires_observation },
                    { label: 'Freios', status: selectedChecklist.brakes_status, obs: selectedChecklist.brakes_observation },
                    { label: 'Óleo do Motor', status: selectedChecklist.engine_oil_status, obs: selectedChecklist.engine_oil_observation },
                    { label: 'Luzes', status: selectedChecklist.lights_status, obs: selectedChecklist.lights_observation },
                    { label: 'Sistema Elétrico', status: selectedChecklist.electrical_status, obs: selectedChecklist.electrical_observation },
                    { label: 'Suspensão', status: selectedChecklist.suspension_status, obs: selectedChecklist.suspension_observation },
                    { label: 'Limpeza', status: selectedChecklist.cleaning_status, obs: selectedChecklist.cleaning_observation },
                    { label: 'Vazamentos', status: selectedChecklist.leaks_status, obs: selectedChecklist.leaks_observation },
                  ].filter(item => item.status).map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{item.label}</span>
                        <Badge 
                          variant={
                            item.status === 'good' ? 'default' : 
                            item.status === 'regular' ? 'secondary' : 'destructive'
                          }
                        >
                          {item.status === 'good' ? 'Bom' : item.status === 'regular' ? 'Regular' : 'Precisa Reparo'}
                        </Badge>
                      </div>
                      {item.obs && (
                        <p className="text-sm text-gray-600">{item.obs}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {selectedChecklist.general_observations && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Observações Gerais</h4>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{selectedChecklist.general_observations}</p>
                </div>
              )}

              {selectedChecklist.damages && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Danos Reportados</h4>
                  <p className="text-red-700 p-3 bg-red-50 rounded-lg">{selectedChecklist.damages}</p>
                </div>
              )}

              {/* Assinatura */}
              {selectedChecklist.signature && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Assinatura</h4>
                  <img 
                    src={selectedChecklist.signature} 
                    alt="Assinatura" 
                    className="max-w-xs border rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={selectedCondominium.name} onBack={onBack}>
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vigilantes</CardTitle>
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
              <CardTitle className="text-sm font-medium">Motocicletas</CardTitle>
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
              <CardTitle className="text-sm font-medium">Checklists</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checklists.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de vistorias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {checklists.filter(c => c.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Checklists pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de conteúdo */}
        <Tabs defaultValue="checklists" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklists" className="text-xs sm:text-sm">Checklists</TabsTrigger>
            <TabsTrigger value="vigilantes" className="text-xs sm:text-sm">Vigilantes</TabsTrigger>
            <TabsTrigger value="motorcycles" className="text-xs sm:text-sm">Motocicletas</TabsTrigger>
          </TabsList>

          <TabsContent value="checklists" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Checklists</CardTitle>
                <CardDescription>
                  Vistorias realizadas recentemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklists.slice(0, 10).map((checklist) => (
                    <div key={checklist.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{checklist.motorcycle_plate}</span>
                          <Badge variant={checklist.type === 'start' ? 'default' : 'secondary'}>
                            {checklist.type === 'start' ? 'Início' : 'Fim'}
                          </Badge>
                          <Badge variant={checklist.status === 'completed' ? 'default' : 'secondary'}>
                            {checklist.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {checklist.vigilante_name} • {format(new Date(checklist.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewChecklist(checklist)}
                          className="flex-1 sm:flex-none"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => downloadChecklistPDF(checklist)}
                          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                  {checklists.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum checklist encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vigilantes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vigilantes</CardTitle>
                <CardDescription>
                  Lista de vigilantes do condomínio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vigilantes.map((vigilante) => (
                    <div key={vigilante.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{vigilante.name}</p>
                        <p className="text-sm text-gray-600">{vigilante.email}</p>
                        <p className="text-xs text-gray-500">Registro: {vigilante.registration}</p>
                      </div>
                      <Badge variant={vigilante.status === 'active' ? 'default' : 'secondary'}>
                        {vigilante.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                  {vigilantes.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum vigilante encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="motorcycles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Motocicletas</CardTitle>
                <CardDescription>
                  Frota de motocicletas do condomínio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {motorcycles.map((motorcycle) => (
                    <div key={motorcycle.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{motorcycle.plate}</p>
                        <p className="text-sm text-gray-600">
                          {motorcycle.brand} {motorcycle.model} {motorcycle.year}
                        </p>
                        <p className="text-xs text-gray-500">Cor: {motorcycle.color}</p>
                      </div>
                      <Badge 
                        variant={
                          motorcycle.status === 'available' ? 'default' : 
                          motorcycle.status === 'in_use' ? 'secondary' : 'destructive'
                        }
                      >
                        {motorcycle.status === 'available' ? 'Disponível' : 
                         motorcycle.status === 'in_use' ? 'Em Uso' : 'Manutenção'}
                      </Badge>
                    </div>
                  ))}
                  {motorcycles.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma motocicleta encontrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
