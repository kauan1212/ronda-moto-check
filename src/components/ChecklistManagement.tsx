import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Calendar, User, Bike, CheckSquare, Download, Trash2 } from 'lucide-react';
import { Condominium, Checklist } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generatePDF } from '@/utils/pdfGenerator';
import jsPDF from 'jspdf';
import { getUserLogo } from '@/utils/pdf/userHelpers';
import { addHeader, addBasicInfo, addInspectionItems, addPhotosSection, addObservations, addSignature } from '@/utils/pdf/pdfSections';

interface ChecklistManagementProps {
  condominium: Condominium;
  checklists: Checklist[];
  onUpdate: () => void;
}

const ChecklistManagement = ({ condominium, checklists, onUpdate }: ChecklistManagementProps) => {
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteChecklist = async (checklistId: string) => {
    setDeletingId(checklistId);
    
    try {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', checklistId);

      if (error) {
        console.error('Erro ao deletar checklist:', error);
        toast.error('Erro ao deletar checklist');
        return;
      }

      toast.success('Checklist deletado com sucesso!');
      onUpdate(); // Atualizar a lista
    } catch (error) {
      console.error('Erro ao deletar checklist:', error);
      toast.error('Erro ao deletar checklist');
    } finally {
      setDeletingId(null);
    }
  };

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

  const generateChecklistPDF = async (checklist: Checklist) => {
    try {
      toast.success('Preparando download do PDF...');
      // Passar o user_id do condomínio para buscar a logo personalizada
      await generatePDF(checklist, condominium.user_id);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  // Função para sanitizar dados potencialmente corrompidos
  const sanitizeChecklistData = (checklist: any) => {
    const sanitized = { ...checklist };
    
    // Sanitizar campos de texto que podem conter caracteres problemáticos
    const textFields = [
      'general_observations', 'damages', 'vigilante_name', 'motorcycle_plate',
      'tires_observation', 'brakes_observation', 'engine_oil_observation',
      'coolant_observation', 'lights_observation', 'electrical_observation',
      'suspension_observation', 'cleaning_observation', 'leaks_observation'
    ];
    
    textFields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        try {
          // Remover caracteres de controle e escape problemáticos
          sanitized[field] = sanitized[field]
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove caracteres de controle
            .replace(/\\(?!["\\/bfnrt])/g, '\\\\') // Escape barras invertidas sozinhas
            .replace(/"/g, '\\"') // Escape aspas duplas
            .trim();
        } catch (error) {
          console.warn(`Erro ao sanitizar campo ${field}:`, error);
          sanitized[field] = `[Campo corrompido - ${field}]`;
        }
      }
    });
    
    // Sanitizar arrays de fotos
    const photoFields = ['motorcycle_photos', 'fuel_photos', 'km_photos'];
    photoFields.forEach(field => {
      if (sanitized[field] && Array.isArray(sanitized[field])) {
        sanitized[field] = sanitized[field].filter(photo => 
          photo && typeof photo === 'string' && photo.trim().length > 0
        );
      }
    });
    
    return sanitized;
  };

  // Exportar todos os checklists do condomínio em um único PDF
  const handleExportAllChecklists = async () => {
    if (!checklists.length) return;
    try {
      console.log('🔄 Iniciando exportação de checklists...', { checklistsCount: checklists.length });
      
      // Sanitizar dados dos checklists primeiro
      const sanitizedChecklists = checklists.map((checklist, index) => {
        try {
          console.log(`🧹 Sanitizando checklist ${index + 1}/${checklists.length} para exportação`);
          return sanitizeChecklistData(checklist);
        } catch (error) {
          console.error(`❌ Erro ao sanitizar checklist ${checklist.id}:`, error);
          return null;
        }
      }).filter(Boolean);

      if (sanitizedChecklists.length === 0) {
        toast.error('Todos os checklists estão corrompidos');
        return;
      }

      console.log('✅ Checklists sanitizados para exportação:', sanitizedChecklists.length);
      
      const pdf = new jsPDF();
      let processedCount = 0;
      
      for (let i = 0; i < sanitizedChecklists.length; i++) {
        const checklist = sanitizedChecklists[i];
        try {
          console.log(`📄 Processando checklist ${i + 1}/${sanitizedChecklists.length}:`, checklist.id);
          
          if (i > 0) pdf.addPage();
          let yPos = 20;
          const margin = 20;
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Buscar logo do usuário com timeout
          const userLogoPromise = getUserLogo(checklist.vigilante_id || undefined);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Logo fetch timeout')), 5000)
          );
          
          let userLogo;
          try {
            userLogo = await Promise.race([userLogoPromise, timeoutPromise]);
          } catch (logoError) {
            console.warn(`⚠️ Erro ao buscar logo do vigilante ${checklist.vigilante_id}:`, logoError);
            userLogo = null;
          }
          
          // Header
          yPos = await addHeader(pdf, userLogo, yPos, margin);
          // Basic Info
          yPos = addBasicInfo(pdf, checklist, yPos, margin, pageWidth);
          // Inspection Items
          yPos = addInspectionItems(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          // Photos (com tratamento de erro)
          try {
            yPos = await addPhotosSection(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          } catch (photoError) {
            console.warn(`⚠️ Erro ao adicionar fotos do checklist ${checklist.id}:`, photoError);
            // Continua sem as fotos
          }
          // Observations
          yPos = addObservations(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          // Signature
          await addSignature(pdf, checklist, yPos, margin, pageHeight);
          
          processedCount++;
        } catch (error) {
          console.error(`❌ Erro ao processar checklist ${checklist.id}:`, error);
          toast.error(`Erro ao processar checklist ${checklist.id} - continuando com os próximos`);
          // Continua com o próximo checklist
        }
      }
      
      if (processedCount === 0) {
        toast.error('Nenhum checklist pôde ser processado');
        return;
      }
      
      const fileName = `checklists-condominio-${condominium.name?.replace(/[^a-zA-Z0-9]/g, '-') || condominium.id}.pdf`;
      console.log('💾 Salvando arquivo:', fileName);
      pdf.save(fileName);
      console.log('✅ Exportação concluída com sucesso!');
      toast.success(`PDF exportado com sucesso! Processados ${processedCount}/${sanitizedChecklists.length} checklists.`);
      
    } catch (err) {
      console.error('❌ Erro ao exportar checklists:', err);
      toast.error('Erro ao exportar checklists: ' + (err instanceof Error ? err.message : String(err)));
    }
  };


  // Função para baixar PDF e deletar todos os checklists
  const handleDownloadAndDelete = async () => {
    if (!checklists.length) return;
    
    if (!window.confirm('Esta ação irá baixar o PDF com todos os checklists e depois deletá-los permanentemente. Tem certeza que deseja continuar? Esta ação não pode ser desfeita.')) return;
    
    try {
      console.log('🔄 Iniciando sanitização e processamento de checklists...', { checklistsCount: checklists.length });
      
      // Sanitizar dados dos checklists
      const sanitizedChecklists = checklists.map((checklist, index) => {
        try {
          console.log(`🧹 Sanitizando checklist ${index + 1}/${checklists.length}`);
          return sanitizeChecklistData(checklist);
        } catch (error) {
          console.error(`❌ Erro ao sanitizar checklist ${checklist.id}:`, error);
          toast.error(`Checklist ${checklist.id} está corrompido e será ignorado`);
          return null;
        }
      }).filter(Boolean); // Remove itens nulos

      if (sanitizedChecklists.length === 0) {
        toast.error('Todos os checklists estão corrompidos');
        return;
      }

      console.log('✅ Checklists sanitizados:', sanitizedChecklists.length);
      toast.success('Preparando download do PDF...');

      const pdf = new jsPDF();
      let processedCount = 0;
      
      for (let i = 0; i < sanitizedChecklists.length; i++) {
        const checklist = sanitizedChecklists[i];
        try {
          console.log(`📄 Processando checklist ${i + 1}/${sanitizedChecklists.length}:`, checklist.id);
          
          if (i > 0) pdf.addPage();
          let yPos = 20;
          const margin = 20;
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Buscar logo do usuário com timeout
          const userLogoPromise = getUserLogo(checklist.vigilante_id || undefined);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Logo fetch timeout')), 5000)
          );
          
          let userLogo;
          try {
            userLogo = await Promise.race([userLogoPromise, timeoutPromise]);
          } catch (logoError) {
            console.warn(`⚠️ Erro ao buscar logo do vigilante ${checklist.vigilante_id}:`, logoError);
            userLogo = null;
          }
          
          // Header
          yPos = await addHeader(pdf, userLogo, yPos, margin);
          // Basic Info
          yPos = addBasicInfo(pdf, checklist, yPos, margin, pageWidth);
          // Inspection Items
          yPos = addInspectionItems(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          // Photos (com tratamento de erro)
          try {
            yPos = await addPhotosSection(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          } catch (photoError) {
            console.warn(`⚠️ Erro ao adicionar fotos do checklist ${checklist.id}:`, photoError);
            // Continua sem as fotos
          }
          // Observations
          yPos = addObservations(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          // Signature
          await addSignature(pdf, checklist, yPos, margin, pageHeight);
          
          processedCount++;
        } catch (error) {
          console.error(`❌ Erro ao processar checklist ${checklist.id}:`, error);
          toast.error(`Erro ao processar checklist ${checklist.id} - continuando com os próximos`);
          // Continua com o próximo checklist
        }
      }
      
      if (processedCount === 0) {
        toast.error('Nenhum checklist pôde ser processado');
        return;
      }
      
      const fileName = `checklists-condominio-${condominium.name?.replace(/[^a-zA-Z0-9]/g, '-') || condominium.id}.pdf`;
      console.log('💾 Salvando arquivo:', fileName);
      pdf.save(fileName);
      toast.success(`PDF baixado com sucesso! Processados ${processedCount}/${sanitizedChecklists.length} checklists. Agora deletando...`);
      
      // Aguardar um pouco para garantir que o download foi iniciado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Depois, deletar todos os checklists
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('condominium_id', condominium.id);
        
      if (error) {
        console.error('❌ Erro ao deletar checklists:', error);
        toast.error('PDF baixado, mas erro ao deletar checklists: ' + error.message);
      } else {
        console.log('✅ Checklists deletados com sucesso');
        toast.success('PDF baixado e todos os checklists foram deletados com sucesso!');
        onUpdate();
      }
      
    } catch (err) {
      console.error('❌ Erro no processo de download e delete:', err);
      toast.error('Erro no processo: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Deletar todos os checklists do condomínio
  const handleDeleteAllChecklists = async () => {
    if (!checklists.length) return;
    if (!window.confirm('Tem certeza que deseja deletar TODOS os checklists deste condomínio? Esta ação não pode ser desfeita.')) return;
    try {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('condominium_id', condominium.id);
      if (error) {
        toast.error('Erro ao deletar checklists: ' + error.message);
      } else {
        toast.success('Todos os checklists foram deletados com sucesso!');
        onUpdate();
      }
    } catch (err) {
      toast.error('Erro ao deletar checklists: ' + (err.message || err));
    }
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
            {/* Botões de exportação/deleção em lote */}
            {safeChecklists.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Button onClick={handleDownloadAndDelete} variant="default" className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF e Deletar Todos os Checklists
                </Button>
                <Button onClick={handleExportAllChecklists} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Apenas Exportar PDF
                </Button>
                <Button onClick={handleDeleteAllChecklists} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Apenas Deletar Todos
                </Button>
              </div>
            )}
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

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletingId === checklist.id}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deletingId === checklist.id ? 'Deletando...' : 'Deletar'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar este checklist? Esta ação não pode ser desfeita.
                                  <br /><br />
                                  <strong>Vigilante:</strong> {checklist.vigilante_name}<br />
                                  <strong>Motocicleta:</strong> {checklist.motorcycle_plate}<br />
                                  <strong>Data:</strong> {format(new Date(checklist.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteChecklist(checklist.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
