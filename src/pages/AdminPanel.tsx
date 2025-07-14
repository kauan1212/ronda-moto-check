import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2, Users, Car, CheckSquare, Image, UserCog, ArrowLeft, Download, Trash2 } from 'lucide-react';
import CondominiumManagement from '@/components/CondominiumManagement';
import VigilanteManagement from '@/components/VigilanteManagement';
import MotorcycleManagement from '@/components/MotorcycleManagement';
import ChecklistManagement from '@/components/ChecklistManagement';
import LogoManagement from '@/components/LogoManagement';
import UserManagement from '@/components/UserManagement';
import CondominiumSelector from '@/components/CondominiumSelector';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Condominium, Vigilante, Motorcycle, Checklist } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { generatePDF } from '@/utils/pdf/pdfGenerator';
import jsPDF from 'jspdf';
import { getUserLogo } from '@/utils/pdf/userHelpers';
import { addHeader, addBasicInfo, addInspectionItems, addPhotosSection, addObservations, addSignature } from '@/utils/pdf/pdfSections';
import { toast } from 'sonner';

const AdminPanel = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string>('');

  const isGeneralAdmin = user?.email === 'kauankg@hotmail.com';
  const isSuperAdmin = user?.email === 'kauankg@hotmail.com';

  // Query para condomínios - admin geral vê todos, usuários normais veem apenas os seus
  const { data: condominiums = [], isLoading: condominiumsLoading, refetch: refetchCondominiums } = useQuery({
    queryKey: ['condominiums', user?.id, isGeneralAdmin],
    queryFn: async () => {
      if (!user?.id) {
        console.log('AdminPanel: No user found, skipping condominiums fetch');
        return [];
      }
      
      console.log('AdminPanel: Fetching condominiums for user:', user.id, 'isGeneralAdmin:', isGeneralAdmin);
      
      let query = supabase.from('condominiums').select('*').order('name');
      
      // Se não for admin geral, filtra apenas os condomínios do usuário
      if (!isGeneralAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('AdminPanel: Error fetching condominiums:', error);
        throw error;
      }
      
      console.log('AdminPanel: Fetched condominiums:', data?.length);
      return data as Condominium[];
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Force refetch when user changes
  useEffect(() => {
    if (user?.id && !authLoading) {
      console.log('AdminPanel: User changed, refetching condominiums for:', user.id);
      refetchCondominiums();
    }
  }, [user?.id, authLoading, refetchCondominiums]);

  const { data: vigilantes = [], refetch: refetchVigilantes } = useQuery({
    queryKey: ['vigilantes', selectedCondominiumId],
    queryFn: async () => {
      if (!selectedCondominiumId) return [];
      
      const { data, error } = await supabase
        .from('vigilantes')
        .select('*')
        .eq('condominium_id', selectedCondominiumId)
        .order('name');
      
      if (error) throw error;
      return data as Vigilante[];
    },
    enabled: !!selectedCondominiumId
  });

  const { data: motorcycles = [], refetch: refetchMotorcycles } = useQuery({
    queryKey: ['motorcycles', selectedCondominiumId],
    queryFn: async () => {
      if (!selectedCondominiumId) return [];
      
      const { data, error } = await supabase
        .from('motorcycles')
        .select('*')
        .eq('condominium_id', selectedCondominiumId)
        .order('plate');
      
      if (error) throw error;
      return data as Motorcycle[];
    },
    enabled: !!selectedCondominiumId
  });

  const { data: checklists = [], refetch: refetchChecklists } = useQuery({
    queryKey: ['checklists', selectedCondominiumId],
    queryFn: async () => {
      if (!selectedCondominiumId) return [];
      
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('condominium_id', selectedCondominiumId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Checklist[];
    },
    enabled: !!selectedCondominiumId
  });

  const selectedCondominium = condominiums.find(c => c.id === selectedCondominiumId);

  const handleUpdate = () => {
    refetchVigilantes();
    refetchMotorcycles();
    refetchChecklists();
  };

  const handleCondominiumSelect = (condominium: Condominium) => {
    // Admin geral pode selecionar qualquer condomínio
    if (!isGeneralAdmin && condominium.user_id !== user?.id) {
      console.warn('AdminPanel: Attempted to select condominium not owned by user');
      return;
    }
    console.log('AdminPanel: Selected condominium:', condominium.name);
    setSelectedCondominiumId(condominium.id);
  };

  const handleBack = async () => {
    try {
      navigate('/');
      await signOut();
    } catch (error) {
      console.error('AdminPanel: Error signing out:', error);
      navigate('/');
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

  // Função para baixar PDF de um condomínio específico e deletar seus checklists
  const handleDownloadAndDeleteCondominium = async (condominiumId: string) => {
    try {
      console.log('🔄 Iniciando busca de checklists para condomínio:', condominiumId);
      
      // Buscar checklists do condomínio com tratamento de erro
      const { data: rawChecklists, error: checklistsError } = await supabase
        .from('checklists')
        .select('*')
        .eq('condominium_id', condominiumId)
        .order('created_at', { ascending: false });

      if (checklistsError) {
        console.error('❌ Erro ao buscar checklists:', checklistsError);
        toast.error('Erro ao buscar checklists: ' + checklistsError.message);
        return;
      }

      if (!rawChecklists || rawChecklists.length === 0) {
        toast.error('Nenhum checklist encontrado para este condomínio');
        return;
      }

      console.log('📋 Checklists encontrados:', rawChecklists.length);

      // Sanitizar dados dos checklists
      const condominiumChecklists = rawChecklists.map((checklist, index) => {
        try {
          console.log(`🧹 Sanitizando checklist ${index + 1}/${rawChecklists.length}`);
          return sanitizeChecklistData(checklist);
        } catch (error) {
          console.error(`❌ Erro ao sanitizar checklist ${checklist.id}:`, error);
          toast.error(`Checklist ${checklist.id} está corrompido e será ignorado`);
          return null;
        }
      }).filter(Boolean); // Remove itens nulos

      if (condominiumChecklists.length === 0) {
        toast.error('Todos os checklists estão corrompidos');
        return;
      }

      console.log('✅ Checklists sanitizados:', condominiumChecklists.length);

      const condominium = condominiums.find(c => c.id === condominiumId);
      if (!condominium) {
        toast.error('Condomínio não encontrado');
        return;
      }

      if (!window.confirm(`Esta ação irá baixar o PDF com todos os checklists do condomínio "${condominium.name}" e depois deletá-los permanentemente. Tem certeza que deseja continuar? Esta ação não pode ser desfeita.`)) {
        return;
      }

      toast.success('Preparando download do PDF...');

      // Gerar PDF com tratamento de erro individual por checklist
      const pdf = new jsPDF();
      let processedCount = 0;
      
      for (let i = 0; i < condominiumChecklists.length; i++) {
        const checklist = condominiumChecklists[i];
        try {
          console.log(`📄 Processando checklist ${i + 1}/${condominiumChecklists.length}:`, checklist.id);
          
          if (i > 0) pdf.addPage();
          let yPos = 20;
          const margin = 20;
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Buscar logo do usuário
          const userLogo = await getUserLogo(checklist.vigilante_id || undefined);
          
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
      
      const fileName = `checklists-${condominium.name?.replace(/[^a-zA-Z0-9]/g, '-') || condominiumId}.pdf`;
      console.log('💾 Salvando arquivo:', fileName);
      pdf.save(fileName);
      toast.success(`PDF baixado com sucesso! Processados ${processedCount}/${condominiumChecklists.length} checklists. Agora deletando...`);
      
      // Aguardar um pouco para garantir que o download foi iniciado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Deletar checklists
      const { error: deleteError } = await supabase
        .from('checklists')
        .delete()
        .eq('condominium_id', condominiumId);
        
      if (deleteError) {
        console.error('❌ Erro ao deletar checklists:', deleteError);
        toast.error('PDF baixado, mas erro ao deletar checklists: ' + deleteError.message);
      } else {
        console.log('✅ Checklists deletados com sucesso');
        toast.success(`PDF baixado e todos os checklists do condomínio "${condominium.name}" foram deletados com sucesso!`);
        refetchChecklists();
      }
      
    } catch (err) {
      console.error('❌ Erro no processo de download e delete:', err);
      toast.error('Erro no processo: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Função para apenas baixar PDF de um condomínio específico
  const handleExportCondominiumChecklists = async (condominiumId: string) => {
    try {
      console.log('🔄 Iniciando exportação de checklists para condomínio:', condominiumId);
      
      // Buscar checklists do condomínio
      const { data: rawChecklists, error: checklistsError } = await supabase
        .from('checklists')
        .select('*')
        .eq('condominium_id', condominiumId)
        .order('created_at', { ascending: false });

      if (checklistsError) {
        console.error('❌ Erro ao buscar checklists:', checklistsError);
        toast.error('Erro ao buscar checklists: ' + checklistsError.message);
        return;
      }

      if (!rawChecklists || rawChecklists.length === 0) {
        toast.error('Nenhum checklist encontrado para este condomínio');
        return;
      }

      // Sanitizar dados dos checklists
      const condominiumChecklists = rawChecklists.map((checklist, index) => {
        try {
          console.log(`🧹 Sanitizando checklist ${index + 1}/${rawChecklists.length} para exportação`);
          return sanitizeChecklistData(checklist);
        } catch (error) {
          console.error(`❌ Erro ao sanitizar checklist ${checklist.id}:`, error);
          return null;
        }
      }).filter(Boolean);

      if (condominiumChecklists.length === 0) {
        toast.error('Todos os checklists estão corrompidos');
        return;
      }

      const condominium = condominiums.find(c => c.id === condominiumId);
      if (!condominium) {
        toast.error('Condomínio não encontrado');
        return;
      }

      toast.success('Preparando download do PDF...');

      // Gerar PDF
      const pdf = new jsPDF();
      let processedCount = 0;
      
      for (let i = 0; i < condominiumChecklists.length; i++) {
        const checklist = condominiumChecklists[i];
        try {
          console.log(`📄 Processando checklist ${i + 1}/${condominiumChecklists.length}:`, checklist.id);
          
          if (i > 0) pdf.addPage();
          let yPos = 20;
          const margin = 20;
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Buscar logo do usuário
          const userLogo = await getUserLogo(checklist.vigilante_id || undefined);
          
          // Header
          yPos = await addHeader(pdf, userLogo, yPos, margin);
          // Basic Info
          yPos = addBasicInfo(pdf, checklist, yPos, margin, pageWidth);
          // Inspection Items
          yPos = addInspectionItems(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          // Photos
          try {
            yPos = await addPhotosSection(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          } catch (photoError) {
            console.warn(`⚠️ Erro ao adicionar fotos do checklist ${checklist.id}:`, photoError);
          }
          // Observations
          yPos = addObservations(pdf, checklist, yPos, margin, pageWidth, pageHeight);
          // Signature
          await addSignature(pdf, checklist, yPos, margin, pageHeight);
          
          processedCount++;
        } catch (error) {
          console.error(`❌ Erro ao processar checklist ${checklist.id}:`, error);
          // Continua com o próximo checklist
        }
      }
      
      if (processedCount === 0) {
        toast.error('Nenhum checklist pôde ser processado');
        return;
      }
      
      const fileName = `checklists-${condominium.name?.replace(/[^a-zA-Z0-9]/g, '-') || condominiumId}.pdf`;
      pdf.save(fileName);
      toast.success(`PDF exportado com sucesso! Processados ${processedCount}/${condominiumChecklists.length} checklists.`);
      
    } catch (err) {
      console.error('❌ Erro ao exportar checklists:', err);
      toast.error('Erro ao exportar checklists: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Função para deletar todos os checklists de um condomínio específico
  const handleDeleteCondominiumChecklists = async (condominiumId: string) => {
    try {
      // Buscar checklists do condomínio para verificar se existem
      const { data: condominiumChecklists, error: checklistsError } = await supabase
        .from('checklists')
        .select('id')
        .eq('condominium_id', condominiumId);

      if (checklistsError) {
        toast.error('Erro ao verificar checklists: ' + checklistsError.message);
        return;
      }

      if (!condominiumChecklists || condominiumChecklists.length === 0) {
        toast.error('Nenhum checklist encontrado para este condomínio');
        return;
      }

      const condominium = condominiums.find(c => c.id === condominiumId);
      if (!condominium) {
        toast.error('Condomínio não encontrado');
        return;
      }

      if (!window.confirm(`Tem certeza que deseja deletar TODOS os ${condominiumChecklists.length} checklists do condomínio "${condominium.name}"? Esta ação não pode ser desfeita.`)) {
        return;
      }

      const { error: deleteError } = await supabase
        .from('checklists')
        .delete()
        .eq('condominium_id', condominiumId);
        
      if (deleteError) {
        toast.error('Erro ao deletar checklists: ' + deleteError.message);
      } else {
        toast.success(`Todos os checklists do condomínio "${condominium.name}" foram deletados com sucesso!`);
        refetchChecklists();
      }
      
    } catch (err) {
      console.error('Erro ao deletar checklists:', err);
      toast.error('Erro ao deletar checklists: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Função para exportar todos os checklists do condomínio selecionado em um único PDF
  const handleExportChecklists = async () => {
    if (!selectedCondominiumId || !checklists.length) return;
    try {
      console.log('Iniciando exportação de checklists...', { selectedCondominiumId, checklistsCount: checklists.length });
      
      const pdf = new jsPDF();
      for (let i = 0; i < checklists.length; i++) {
        const checklist = checklists[i];
        console.log(`Processando checklist ${i + 1}/${checklists.length}:`, checklist.id);
        
        if (i > 0) pdf.addPage();
        let yPos = 20;
        const margin = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Buscar logo do usuário
        const userLogo = await getUserLogo(checklist.vigilante_id || undefined);
        
        // Header
        yPos = await addHeader(pdf, userLogo, yPos, margin);
        // Basic Info
        yPos = addBasicInfo(pdf, checklist, yPos, margin, pageWidth);
        // Inspection Items
        yPos = addInspectionItems(pdf, checklist, yPos, margin, pageWidth, pageHeight);
        // Photos
        yPos = await addPhotosSection(pdf, checklist, yPos, margin, pageWidth, pageHeight);
        // Observations
        yPos = addObservations(pdf, checklist, yPos, margin, pageWidth, pageHeight);
        // Signature
        await addSignature(pdf, checklist, yPos, margin, pageHeight);
      }
      
      const fileName = `checklists-condominio-${selectedCondominium?.name?.replace(/[^a-zA-Z0-9]/g, '-') || selectedCondominiumId}.pdf`;
      console.log('Salvando arquivo:', fileName);
      pdf.save(fileName);
      console.log('Exportação concluída com sucesso!');
      
    } catch (err) {
      console.error('Erro ao exportar checklists:', err);
      alert('Erro ao exportar checklists: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Função para deletar todos os checklists do condomínio selecionado
  const handleDeleteChecklists = async () => {
    if (!selectedCondominiumId || !checklists.length) return;
    if (!window.confirm('Tem certeza que deseja deletar TODOS os checklists deste condomínio? Esta ação não pode ser desfeita.')) return;
    try {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('condominium_id', selectedCondominiumId);
      if (error) {
        alert('Erro ao deletar checklists: ' + error.message);
      } else {
        alert('Todos os checklists foram deletados com sucesso!');
        refetchChecklists();
      }
    } catch (err) {
      alert('Erro ao deletar checklists: ' + (err.message || err));
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {isGeneralAdmin && (
            <Button 
              onClick={handleBack}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isGeneralAdmin ? 'Painel Administrativo Geral' : 'Painel Administrativo'}
          </h1>
        </div>
      </div>

      <CondominiumSelector
        condominiums={condominiums}
        selectedId={selectedCondominiumId}
        onSelect={handleCondominiumSelect}
        loading={condominiumsLoading || authLoading}
      />

      <Tabs defaultValue="condominiums" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className={`grid w-full ${isGeneralAdmin ? (isSuperAdmin ? 'grid-cols-4' : 'grid-cols-3') : 'grid-cols-6'} min-w-max gap-1`}>
            <TabsTrigger value="condominiums" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Condomínios</span>
              <span className="sm:hidden">Cond.</span>
            </TabsTrigger>
            
            {/* Aba de usuários apenas para super admin */}
            {isSuperAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                <UserCog className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Usuários</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
            )}
            
            {!isGeneralAdmin && (
              <>
                <TabsTrigger value="vigilantes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Vigilantes</span>
                  <span className="sm:hidden">Vigil.</span>
                </TabsTrigger>
                <TabsTrigger value="motorcycles" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                  <Car className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Veículos</span>
                  <span className="sm:hidden">Veíc.</span>
                </TabsTrigger>
              </>
            )}
            
            <TabsTrigger value="checklists" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
              <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Checklists</span>
              <span className="sm:hidden">Check.</span>
            </TabsTrigger>
            
            <TabsTrigger value="logo" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
              <Image className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              Logo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="condominiums" className="space-y-4 sm:space-y-6">
          <CondominiumManagement 
            onSelect={handleCondominiumSelect} 
            onExportChecklists={handleExportCondominiumChecklists}
            onDeleteChecklists={handleDeleteCondominiumChecklists}
            onDownloadAndDelete={handleDownloadAndDeleteCondominium}
            isGeneralAdmin={isGeneralAdmin}
          />
        </TabsContent>

        {/* Tab de usuários apenas para super admin */}
        {isSuperAdmin && (
          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <UserManagement />
          </TabsContent>
        )}

        {!isGeneralAdmin && (
          <>
            <TabsContent value="vigilantes" className="space-y-4 sm:space-y-6">
              {selectedCondominium ? (
                <VigilanteManagement 
                  condominium={selectedCondominium}
                  vigilantes={vigilantes}
                  onUpdate={handleUpdate}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm sm:text-base px-4">
                  Selecione um condomínio para gerenciar vigilantes
                </div>
              )}
            </TabsContent>

            <TabsContent value="motorcycles" className="space-y-4 sm:space-y-6">
              {selectedCondominium ? (
                <MotorcycleManagement 
                  condominium={selectedCondominium}
                  motorcycles={motorcycles}
                  onUpdate={handleUpdate}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm sm:text-base px-4">
                  Selecione um condomínio para gerenciar veículos
                </div>
              )}
            </TabsContent>
          </>
        )}

        <TabsContent value="checklists" className="space-y-4 sm:space-y-6">
          {/* Botões de exportação e deleção de checklists por condomínio, agora para qualquer usuário */}
          {selectedCondominiumId && checklists.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Button onClick={handleExportChecklists} variant="default">
                Exportar Todos os Checklists do Condomínio
              </Button>
              <Button onClick={handleDeleteChecklists} variant="destructive">
                Deletar Todos os Checklists do Condomínio
              </Button>
            </div>
          )}
          {selectedCondominium ? (
            <ChecklistManagement 
              condominium={selectedCondominium}
              checklists={checklists}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm sm:text-base px-4">
              Selecione um condomínio para visualizar checklists
            </div>
          )}
        </TabsContent>

        <TabsContent value="logo" className="space-y-4 sm:space-y-6">
          <LogoManagement isGeneralAdmin={isGeneralAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
