
import { useState } from 'react';
import { ChecklistFormData } from '@/types/checklist';

const initialFormData: ChecklistFormData = {
  vigilante_id: '',
  motorcycle_id: '',
  type: 'start',
  face_photo: '',
  tires_status: '',
  tires_observation: '',
  brakes_status: '',
  brakes_observation: '',
  engine_oil_status: '',
  engine_oil_observation: '',
  coolant_status: '',
  coolant_observation: '',
  lights_status: '',
  lights_observation: '',
  electrical_status: '',
  electrical_observation: '',
  suspension_status: '',
  suspension_observation: '',
  cleaning_status: '',
  cleaning_observation: '',
  leaks_status: '',
  leaks_observation: '',
  vehicle_photos: [],
  fuel_photos: [],
  motorcycle_km: '',
  km_photos: [],
  general_observations: '',
  damages: '',
  signature: '',
  fuel_level: 0
};

export const useChecklistForm = () => {
  const [formData, setFormData] = useState<ChecklistFormData>(initialFormData);

  const updateFormData = (updates: Partial<ChecklistFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return {
    formData,
    updateFormData,
    resetForm
  };
};
