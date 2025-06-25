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

  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      return '';
    }
  };

  const downloadChecklistPDF = async (checklist: Checklist) => {
    try {
      toast.info('Gerando relatório... Por favor aguarde.');
      
      // Converter todas as imagens para base64
      const facePhotoBase64 = checklist.face_photo ? await convertImageToBase64(checklist.face_photo) : '';
      const signatureBase64 = checklist.signature ? await convertImageToBase64(checklist.signature) : '';
      
      const motorcyclePhotosBase64 = await Promise.all(
        (checklist.motorcycle_photos || []).map(url => convertImageToBase64(url))
      );
      
      const fuelPhotosBase64 = await Promise.all(
        (checklist.fuel_photos || []).map(url => convertImageToBase64(url))
      );
      
      const kmPhotosBase64 = await Promise.all(
        (checklist.km_photos || []).map(url => convertImageToBase64(url))
      );

      // Criar conteúdo HTML melhorado para PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Checklist de Vistoria - ${checklist.motorcycle_plate}</title>
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 0;
                line-height: 1.4; 
                color: #333;
                font-size: 12px;
              }
              
              .header { 
                text-align: center; 
                border-bottom: 3px solid #2563eb; 
                padding-bottom: 20px; 
                margin-bottom: 30px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 20px;
                border-radius: 8px;
              }
              
              .header h1 { 
                color: #1e40af; 
                margin: 0 0 10px 0; 
                font-size: 24px;
                font-weight: bold;
              }
              
              .header h2 { 
                color: #3730a3; 
                margin: 0 0 15px 0; 
                font-size: 18px;
              }
              
              .info-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
                margin-bottom: 30px; 
              }
              
              .info-box {
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
              }
              
              .info-box h3 {
                margin: 0 0 10px 0;
                color: #1e40af;
                font-size: 14px;
                font-weight: bold;
              }
              
              .info-box p {
                margin: 5px 0;
                font-size: 12px;
              }
              
              .section { 
                margin-bottom: 25px; 
                page-break-inside: avoid;
              }
              
              .section h3 {
                color: #1e40af;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 8px;
                margin-bottom: 15px;
                font-size: 16px;
              }
              
              .item { 
                margin-bottom: 12px; 
                padding: 12px; 
                border-radius: 6px;
                background: #ffffff;
                border: 1px solid #e2e8f0;
              }
              
              .item-header {
                display: flex;
                justify-content: between;
                align-items: center;
                margin-bottom: 8px;
              }
              
              .item-title {
                font-weight: bold;
                color: #374151;
                font-size: 13px;
              }
              
              .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              }
              
              .status-good { 
                background: #dcfce7;
                color: #166534;
                border: 1px solid #bbf7d0;
              }
              
              .status-regular { 
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #fde68a;
              }
              
              .status-repair { 
                background: #fee2e2;
                color: #dc2626;
                border: 1px solid #fecaca;
              }
              
              .observation {
                font-style: italic;
                color: #6b7280;
                margin-top: 8px;
                padding: 8px;
                background: #f9fafb;
                border-radius: 4px;
                font-size: 11px;
              }
              
              .photos-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 15px 0;
              }
              
              .photo-container {
                text-align: center;
                page-break-inside: avoid;
              }
              
              .photo-container img { 
                max-width: 100%; 
                max-height: 200px;
                border-radius: 6px;
                border: 2px solid #e5e7eb;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              .photo-label {
                margin-top: 8px;
                font-size: 11px;
                color: #6b7280;
                font-weight: bold;
              }
              
              .signature-section { 
                margin-top: 40px; 
                text-align: center;
                page-break-inside: avoid;
              }
              
              .signature-section h3 {
                color: #1e40af;
                margin-bottom: 20px;
              }
              
              .signature-section img {
                max-width: 300px;
                border: 2px solid #d1d5db;
                border-radius: 8px;
                background: white;
                padding: 10px;
              }
              
              .face-photo {
                float: right;
                margin: 0 0 20px 20px;
                max-width: 150px;
                border-radius: 8px;
                border: 2px solid #2563eb;
              }
              
              @media print {
                .page-break { page-break-before: always; }
                body { print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Vistoria de Motocicleta</h1>
              <h2>${selectedCondominium.name}</h2>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                <div>
                  <strong>Motocicleta:</strong> ${checklist.motorcycle_plate}<br>
                  <strong>Tipo:</strong> ${checklist.type === 'start' ? 'Início do Turno' : 'Fim do Turno'}
                </div>
                ${facePhotoBase64 ? `<img src="${facePhotoBase64}" alt="Foto do Vigilante" class="face-photo" />` : ''}
              </div>
            </div>

            <div class="info-grid">
              <div class="info-box">
                <h3>Informações do Vigilante</h3>
                <p><strong>Nome:</strong> ${checklist.vigilante_name}</p>
                <p><strong>Data da Vistoria:</strong> ${format(new Date(checklist.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                ${checklist.completed_at ? `<p><strong>Concluído em:</strong> ${format(new Date(checklist.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>` : ''}
              </div>
              <div class="info-box">
                <h3>Dados da Motocicleta</h3>
                <p><strong>Quilometragem:</strong> ${checklist.motorcycle_km || 'Não informado'} km</p>
                <p><strong>Nível de Combustível:</strong> ${checklist.fuel_level || 0}%</p>
                <p><strong>Status da Vistoria:</strong> ${checklist.status}</p>
              </div>
            </div>

            <div class="section">
              <h3>Itens Verificados na Vistoria</h3>
              
              ${[
                { label: 'Pneus', status: checklist.tires_status, obs: checklist.tires_observation },
                { label: 'Freios', status: checklist.brakes_status, obs: checklist.brakes_observation },
                { label: 'Óleo do Motor', status: checklist.engine_oil_status, obs: checklist.engine_oil_observation },
                { label: 'Sistema de Arrefecimento', status: checklist.coolant_status, obs: checklist.coolant_observation },
                { label: 'Sistema de Iluminação', status: checklist.lights_status, obs: checklist.lights_observation },
                { label: 'Sistema Elétrico', status: checklist.electrical_status, obs: checklist.electrical_observation },
                { label: 'Suspensão', status: checklist.suspension_status, obs: checklist.suspension_observation },
                { label: 'Limpeza Geral', status: checklist.cleaning_status, obs: checklist.cleaning_observation },
                { label: 'Vazamentos', status: checklist.leaks_status, obs: checklist.leaks_observation }
              ].filter(item => item.status).map(item => `
                <div class="item">
                  <div class="item-header">
                    <span class="item-title">${item.label}</span>
                    <span class="status-badge status-${item.status === 'good' ? 'good' : item.status === 'regular' ? 'regular' : 'repair'}">
                      ${item.status === 'good' ? 'BOM' : item.status === 'regular' ? 'REGULAR' : 'PRECISA REPARO'}
                    </span>
                  </div>
                  ${item.obs ? `<div class="observation"><strong>Observação:</strong> ${item.obs}</div>` : ''}
                </div>
              `).join('')}
            </div>

            ${motorcyclePhotosBase64.length > 0 ? `
              <div class="section page-break">
                <h3>Fotos da Motocicleta</h3>
                <div class="photos-grid">
                  ${motorcyclePhotosBase64.map((photo, index) => `
                    <div class="photo-container">
                      <img src="${photo}" alt="Foto da Motocicleta ${index + 1}" />
                      <div class="photo-label">Motocicleta - Foto ${index + 1}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${fuelPhotosBase64.length > 0 ? `
              <div class="section">
                <h3>Fotos do Nível de Combustível</h3>
                <div class="photos-grid">
                  ${fuelPhotosBase64.map((photo, index) => `
                    <div class="photo-container">
                      <img src="${photo}" alt="Foto do Combustível ${index + 1}" />
                      <div class="photo-label">Combustível - Foto ${index + 1}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${kmPhotosBase64.length > 0 ? `
              <div class="section">
                <h3>Fotos da Quilometragem</h3>
                <div class="photos-grid">
                  ${kmPhotosBase64.map((photo, index) => `
                    <div class="photo-container">
                      <img src="${photo}" alt="Foto da Quilometragem ${index + 1}" />
                      <div class="photo-label">Quilometragem - Foto ${index + 1}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${checklist.general_observations ? `
              <div class="section">
                <h3>Observações Gerais</h3>
                <div style="padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
                  ${checklist.general_observations}
                </div>
              </div>
            ` : ''}

            ${checklist.damages ? `
              <div class="section">
                <h3>Danos Reportados</h3>
                <div style="padding: 15px; background: #fee2e2; border-radius: 8px; border-left: 4px solid #dc2626; color: #7f1d1d;">
                  ${checklist.damages}
                </div>
              </div>
            ` : ''}

            ${signatureBase64 ? `
              <div class="signature-section page-break">
                <h3>Assinatura do Vigilante</h3>
                <img src="${signatureBase64}" alt="Assinatura do Vigilante" />
                <p style="margin-top: 15px; color: #6b7280; font-size: 11px;">
                  Documento gerado automaticamente em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
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
      link.download = `vistoria-${checklist.motorcycle_plate}-${format(new Date(checklist.created_at), 'dd-MM-yyyy-HH-mm')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
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

              {/* Fotos */}
              {selectedChecklist.motorcycle_photos && selectedChecklist.motorcycle_photos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Fotos da Motocicleta</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedChecklist.motorcycle_photos.map((photo, index) => (
                      <img 
                        key={index}
                        src={photo} 
                        alt={`Foto da motocicleta ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

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
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
