import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Calendar, User, Bike, CheckSquare, Download } from 'lucide-react';
import { Condominium, Checklist } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ChecklistManagementProps {
  condominium: Condominium;
  checklists: Checklist[];
  onUpdate: () => void;
}

const ChecklistManagement = ({ condominium, checklists }: ChecklistManagementProps) => {
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'good':
      case 'bom':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Bom</Badge>;
      case 'regular':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Regular</Badge>;
      case 'needs_repair':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Precisa Reparo</Badge>;
      case 'na':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">N/A</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'start' ? (
      <Badge className="bg-blue-100 text-blue-800">Início do Turno</Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-800">Fim do Turno</Badge>
    );
  };

  const generateChecklistPDF = (checklist: Checklist) => {
    const currentDate = new Date(checklist.created_at);
    const dateStr = currentDate.toLocaleDateString('pt-BR');
    const timeStr = currentDate.toLocaleTimeString('pt-BR');

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'good': return 'Bom';
        case 'regular': return 'Regular';
        case 'needs_repair': return 'Precisa Reparo';
        case 'na': return 'N/A';
        default: return 'Não verificado';
      }
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Checklist de Vistoria - ${checklist.motorcycle_plate}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-card {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .info-card h3 {
            color: #1e40af;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
          }
          .inspection-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .inspection-item {
            background-color: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 20px;
          }
          .inspection-item h4 {
            color: #374151;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: bold;
          }
          .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .status.good { background-color: #dcfce7; color: #166534; }
          .status.regular { background-color: #fef3c7; color: #92400e; }
          .status.needs_repair { background-color: #fee2e2; color: #991b1b; }
          .status.na { background-color: #f3f4f6; color: #6b7280; }
          .observation {
            background-color: #f9fafb;
            padding: 10px;
            border-radius: 4px;
            font-style: italic;
            color: #6b7280;
          }
          .photos-section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
          }
          .signature-section {
            margin-top: 40px;
            padding: 20px;
            background-color: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
          }
          .signature-img {
            max-width: 300px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .datetime-info {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #2563eb;
          }
          .datetime-info strong {
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RELATÓRIO DE VISTORIA DE MOTOCICLETA</h1>
          <div class="datetime-info">
            <strong>Data:</strong> ${dateStr} | <strong>Horário:</strong> ${timeStr}
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h3>📋 Informações da Vistoria</h3>
            <p><strong>Tipo:</strong> ${checklist.type === 'start' ? 'Início de Turno' : 'Fim de Turno'}</p>
            <p><strong>Status:</strong> Concluída</p>
            <p><strong>Quilometragem:</strong> ${checklist.motorcycle_km || 'Não informado'}</p>
          </div>
          
          <div class="info-card">
            <h3>👮 Vigilante Responsável</h3>
            <p><strong>Nome:</strong> ${checklist.vigilante_name}</p>
          </div>
          
          <div class="info-card">
            <h3>🏍️ Dados da Motocicleta</h3>
            <p><strong>Placa:</strong> ${checklist.motorcycle_plate}</p>
          </div>
        </div>

        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">🔍 ITENS VERIFICADOS</h2>
        
        <div class="inspection-grid">
          <div class="inspection-item">
            <h4>🛞 Pneus</h4>
            <div class="status ${checklist.tires_status || ''}">${getStatusLabel(checklist.tires_status || '')}</div>
            ${checklist.tires_observation ? `<div class="observation">${checklist.tires_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🛑 Freios</h4>
            <div class="status ${checklist.brakes_status || ''}">${getStatusLabel(checklist.brakes_status || '')}</div>
            ${checklist.brakes_observation ? `<div class="observation">${checklist.brakes_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🛢️ Óleo do Motor</h4>
            <div class="status ${checklist.engine_oil_status || ''}">${getStatusLabel(checklist.engine_oil_status || '')}</div>
            ${checklist.engine_oil_observation ? `<div class="observation">${checklist.engine_oil_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🌡️ Arrefecimento</h4>
            <div class="status ${checklist.coolant_status || ''}">${getStatusLabel(checklist.coolant_status || '')}</div>
            ${checklist.coolant_observation ? `<div class="observation">${checklist.coolant_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>💡 Sistema de Iluminação</h4>
            <div class="status ${checklist.lights_status || ''}">${getStatusLabel(checklist.lights_status || '')}</div>
            ${checklist.lights_observation ? `<div class="observation">${checklist.lights_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>⚡ Sistema Elétrico</h4>
            <div class="status ${checklist.electrical_status || ''}">${getStatusLabel(checklist.electrical_status || '')}</div>
            ${checklist.electrical_observation ? `<div class="observation">${checklist.electrical_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🔧 Suspensão</h4>
            <div class="status ${checklist.suspension_status || ''}">${getStatusLabel(checklist.suspension_status || '')}</div>
            ${checklist.suspension_observation ? `<div class="observation">${checklist.suspension_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🧽 Limpeza</h4>
            <div class="status ${checklist.cleaning_status || ''}">${getStatusLabel(checklist.cleaning_status || '')}</div>
            ${checklist.cleaning_observation ? `<div class="observation">${checklist.cleaning_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>💧 Vazamentos</h4>
            <div class="status ${checklist.leaks_status || ''}">${getStatusLabel(checklist.leaks_status || '')}</div>
            ${checklist.leaks_observation ? `<div class="observation">${checklist.leaks_observation}</div>` : ''}
          </div>
        </div>

        ${checklist.general_observations ? `
        <div class="info-card">
          <h3>📝 Observações Gerais</h3>
          <p>${checklist.general_observations}</p>
        </div>
        ` : ''}

        ${checklist.damages ? `
        <div class="info-card">
          <h3>⚠️ Danos Identificados</h3>
          <p>${checklist.damages}</p>
        </div>
        ` : ''}

        <div class="photos-section">
          <h3>📸 Registros Fotográficos</h3>
          <p><strong>Fotos da Motocicleta:</strong> ${checklist.motorcycle_photos?.length || 0} foto(s) registrada(s)</p>
          <p><strong>Fotos do Combustível:</strong> ${checklist.fuel_photos?.length || 0} foto(s) registrada(s)</p>
          <p><strong>Fotos do Odômetro:</strong> ${checklist.km_photos?.length || 0} foto(s) registrada(s)</p>
          ${checklist.face_photo ? '<p><strong>Foto Facial:</strong> 1 foto registrada</p>' : ''}
        </div>

        <div class="signature-section">
          <h3>✍️ Assinatura do Vigilante</h3>
          ${checklist.signature ? `<img src="${checklist.signature}" alt="Assinatura" class="signature-img">` : '<p>Assinatura não disponível</p>'}
          <p style="margin-top: 15px;"><strong>Vigilante:</strong> ${checklist.vigilante_name}</p>
          <p><strong>Data e Hora:</strong> ${dateStr} às ${timeStr}</p>
        </div>

        <div class="footer">
          <p>Relatório gerado automaticamente pelo Sistema de Gestão de Vigilância</p>
          <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checklist-${checklist.motorcycle_plate}-${dateStr.replace(/\//g, '-')}-${timeStr.replace(/:/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Relatório PDF gerado com sucesso!');
  };

  const safeChecklists = Array.isArray(checklists) ? checklists : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Checklists - {condominium.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeChecklists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum checklist encontrado</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {safeChecklists.map((checklist) => (
                  <Card key={checklist.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{checklist.vigilante_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bike className="h-4 w-4 text-muted-foreground" />
                              <span>{checklist.motorcycle_plate}</span>
                            </div>
                            {getTypeBadge(checklist.type)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(checklist.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedChecklist(checklist)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Detalhes do Checklist</DialogTitle>
                              </DialogHeader>
                              {selectedChecklist && (
                                <div className="space-y-6">
                                  {/* Informações Básicas */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Vigilante</Label>
                                      <p>{selectedChecklist.vigilante_name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Motocicleta</Label>
                                      <p>{selectedChecklist.motorcycle_plate}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Tipo</Label>
                                      <div className="mt-1">{getTypeBadge(selectedChecklist.type)}</div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Data/Hora</Label>
                                      <p>{format(new Date(selectedChecklist.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                    </div>
                                  </div>

                                  {/* Foto Facial */}
                                  {selectedChecklist.face_photo && (
                                    <div>
                                      <Label className="text-sm font-medium">Foto Facial</Label>
                                      <div className="mt-2">
                                        <img 
                                          src={selectedChecklist.face_photo} 
                                          alt="Foto facial" 
                                          className="w-32 h-32 object-cover rounded-lg border"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Status dos Itens */}
                                  <div>
                                    <Label className="text-sm font-medium mb-3 block">Status dos Itens Verificados</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {[
                                        { key: 'tires', label: 'Pneus', status: selectedChecklist.tires_status, obs: selectedChecklist.tires_observation },
                                        { key: 'brakes', label: 'Freios', status: selectedChecklist.brakes_status, obs: selectedChecklist.brakes_observation },
                                        { key: 'engine_oil', label: 'Óleo do Motor', status: selectedChecklist.engine_oil_status, obs: selectedChecklist.engine_oil_observation },
                                        { key: 'coolant', label: 'Líquido de Arrefecimento', status: selectedChecklist.coolant_status, obs: selectedChecklist.coolant_observation },
                                        { key: 'lights', label: 'Luzes', status: selectedChecklist.lights_status, obs: selectedChecklist.lights_observation },
                                        { key: 'electrical', label: 'Sistema Elétrico', status: selectedChecklist.electrical_status, obs: selectedChecklist.electrical_observation },
                                        { key: 'suspension', label: 'Suspensão', status: selectedChecklist.suspension_status, obs: selectedChecklist.suspension_observation },
                                        { key: 'cleaning', label: 'Limpeza', status: selectedChecklist.cleaning_status, obs: selectedChecklist.cleaning_observation },
                                        { key: 'leaks', label: 'Vazamentos', status: selectedChecklist.leaks_status, obs: selectedChecklist.leaks_observation }
                                      ].map((item) => (
                                        <div key={item.key} className="p-3 border rounded-lg">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{item.label}</span>
                                            {getStatusBadge(item.status || '')}
                                          </div>
                                          {item.obs && (
                                            <p className="text-sm text-muted-foreground">{item.obs}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Fotos da Motocicleta */}
                                  {selectedChecklist.motorcycle_photos && selectedChecklist.motorcycle_photos.length > 0 && (
                                    <div>
                                      <Label className="text-sm font-medium mb-3 block">Fotos da Motocicleta</Label>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {selectedChecklist.motorcycle_photos.map((photo, index) => (
                                          <div key={index} className="aspect-square">
                                            <img 
                                              src={photo} 
                                              alt={`Motocicleta ${index + 1}`} 
                                              className="w-full h-full object-cover rounded-lg border"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Informações Adicionais */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedChecklist.fuel_level !== null && (
                                      <div>
                                        <Label className="text-sm font-medium">Nível de Combustível</Label>
                                        <p>{selectedChecklist.fuel_level}%</p>
                                      </div>
                                    )}
                                    {selectedChecklist.motorcycle_km && (
                                      <div>
                                        <Label className="text-sm font-medium">Quilometragem</Label>
                                        <p>{selectedChecklist.motorcycle_km}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Observações */}
                                  {(selectedChecklist.general_observations || selectedChecklist.damages) && (
                                    <div className="space-y-4">
                                      {selectedChecklist.general_observations && (
                                        <div>
                                          <Label className="text-sm font-medium">Observações Gerais</Label>
                                          <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedChecklist.general_observations}</p>
                                        </div>
                                      )}
                                      {selectedChecklist.damages && (
                                        <div>
                                          <Label className="text-sm font-medium">Danos ou Problemas</Label>
                                          <p className="mt-1 p-3 bg-red-50 rounded-lg text-red-900">{selectedChecklist.damages}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Assinatura */}
                                  {selectedChecklist.signature && (
                                    <div>
                                      <Label className="text-sm font-medium">Assinatura</Label>
                                      <div className="mt-2">
                                        <img 
                                          src={selectedChecklist.signature} 
                                          alt="Assinatura" 
                                          className="w-48 h-24 object-contain border rounded-lg bg-white"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateChecklistPDF(checklist)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistManagement;
