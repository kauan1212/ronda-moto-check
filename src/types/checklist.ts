
export interface VehiclePhoto {
  url: string;
  category: 'front' | 'back' | 'left' | 'right';
}

export interface ChecklistFormData {
  vigilante_id: string;
  motorcycle_id: string;
  type: 'start' | 'end';
  face_photo: string;
  tires_status: string;
  tires_observation: string;
  brakes_status: string;
  brakes_observation: string;
  engine_oil_status: string;
  engine_oil_observation: string;
  coolant_status: string;
  coolant_observation: string;
  lights_status: string;
  lights_observation: string;
  electrical_status: string;
  electrical_observation: string;
  suspension_status: string;
  suspension_observation: string;
  cleaning_status: string;
  cleaning_observation: string;
  leaks_status: string;
  leaks_observation: string;
  vehicle_photos: VehiclePhoto[];
  fuel_photos: string[];
  motorcycle_km: string;
  km_photos: string[];
  general_observations: string;
  damages: string;
  signature: string;
  fuel_level: number;
}
