
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generatePDF } from '@/utils/pdfGenerator';
import { ChecklistFormData } from '@/types/checklist';
import { Vigilante, Motorcycle } from '@/types';

export const useChecklistOperations = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (
    formData: ChecklistFormData,
    vigilantes: Vigilante[],
    motorcycles: Motorcycle[],
    resetForm?: () => void // Tornar opcional para não resetar automaticamente
  ) => {
    if (!formData.vigilante_id || !formData.motorcycle_id) {
      toast.error('Por favor, selecione um vigilante e um veículo');
      return false;
    }

    if (!formData.signature) {
      toast.error('Por favor, adicione sua assinatura');
      return false;
    }

    setIsSaving(true);

    try {
      const selectedVigilante = vigilantes.find(v => v.id === formData.vigilante_id);
      const selectedMotorcycle = motorcycles.find(m => m.id === formData.motorcycle_id);

      if (!selectedVigilante || !selectedMotorcycle) {
        toast.error('Vigilante ou veículo não encontrados');
        return false;
      }

      // Convert vehicle_photos to the format expected by the database
      const vehiclePhotoUrls = formData.vehicle_photos.map(photo => photo.url);

      const checklistData = {
        vigilante_id: formData.vigilante_id,
        motorcycle_id: formData.motorcycle_id,
        vigilante_name: selectedVigilante.name,
        motorcycle_plate: selectedMotorcycle.plate,
        type: formData.type,
        face_photo: formData.face_photo || null,
        tires_status: formData.tires_status || null,
        tires_observation: formData.tires_observation || null,
        brakes_status: formData.brakes_status || null,
        brakes_observation: formData.brakes_observation || null,
        engine_oil_status: formData.engine_oil_status || null,
        engine_oil_observation: formData.engine_oil_observation || null,
        coolant_status: formData.coolant_status || null,
        coolant_observation: formData.coolant_observation || null,
        lights_status: formData.lights_status || null,
        lights_observation: formData.lights_observation || null,
        electrical_status: formData.electrical_status || null,
        electrical_observation: formData.electrical_observation || null,
        suspension_status: formData.suspension_status || null,
        suspension_observation: formData.suspension_observation || null,
        cleaning_status: formData.cleaning_status || null,
        cleaning_observation: formData.cleaning_observation || null,
        leaks_status: formData.leaks_status || null,
        leaks_observation: formData.leaks_observation || null,
        motorcycle_photos: vehiclePhotoUrls,
        fuel_photos: formData.fuel_photos,
        motorcycle_km: formData.motorcycle_km || null,
        km_photos: formData.km_photos,
        general_observations: formData.general_observations || null,
        damages: formData.damages || null,
        signature: formData.signature,
        status: 'completed',
        condominium_id: selectedVigilante.condominium_id || selectedMotorcycle.condominium_id,
        fuel_level: formData.fuel_level
      };

      console.log('Salvando checklist com dados:', checklistData);

      const { data, error } = await supabase
        .from('checklists')
        .insert([checklistData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar checklist:', error);
        toast.error(`Erro ao salvar checklist: ${error.message}`);
        return false;
      }

      console.log('Checklist salvo com sucesso:', data);
      toast.success('Checklist salvo com sucesso! Dados mantidos para nova vistoria.');
      
      // Não resetar automaticamente - apenas se explicitamente solicitado
      if (resetForm) {
        resetForm();
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao salvar checklist');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async (
    formData: ChecklistFormData,
    vigilantes: Vigilante[],
    motorcycles: Motorcycle[],
    userId?: string, // Adicionar parâmetro userId
    checklistCreatedAt?: string // Adicionar parâmetro para data de criação real
  ) => {
    const selectedVigilante = vigilantes.find(v => v.id === formData.vigilante_id);
    const selectedMotorcycle = motorcycles.find(m => m.id === formData.motorcycle_id);

    if (!selectedVigilante || !selectedMotorcycle) {
      toast.error('Selecione um vigilante e um veículo primeiro');
      return;
    }

    // Convert vehicle_photos to motorcycle_photos format for PDF generation
    const vehiclePhotoUrls = formData.vehicle_photos.map(photo => photo.url);

    // Usar a data de criação fornecida ou a atual como fallback
    const creationDate = checklistCreatedAt || new Date().toISOString();

    generatePDF({
      ...formData,
      vigilante_name: selectedVigilante.name,
      motorcycle_plate: selectedMotorcycle.plate,
      id: '',
      created_at: creationDate,
      completed_at: creationDate,
      status: 'completed',
      condominium_id: selectedVigilante.condominium_id || selectedMotorcycle.condominium_id || '',
      motorcycle_photos: vehiclePhotoUrls,
      vehicle_photos: formData.vehicle_photos
    }, userId); // Passar userId para o gerador de PDF
  };

  return {
    isSaving,
    handleSave,
    handleGeneratePDF
  };
};
