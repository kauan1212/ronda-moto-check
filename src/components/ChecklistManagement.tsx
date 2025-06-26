
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Calendar, User, Bike, CheckSquare, AlertTriangle, XCircle, Minus } from 'lucide-react';
import { Condominium, Checklist } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChecklistManagementProps {
  condominium: Condominium;
  checklists: Checklist[];
  onUpdate: () => void;
}

const ChecklistManagement = ({ condominium, checklists, onUpdate }: ChecklistManagementProps) => {
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'good':
        return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'regular':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'needs_repair':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'na':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'start' ? (
      <Badge className="bg-blue-100 text-blue-800">Início do Turno</Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-800">Fim do Turno</Badge>
    );
  };

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
            {checklists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum checklist encontrado</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {checklists.map((checklist) => (
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
