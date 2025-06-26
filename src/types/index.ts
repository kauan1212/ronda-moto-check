
import { VehiclePhoto } from './checklist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vigilante';
  registration: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Condominium {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Vigilante {
  id: string;
  name: string;
  email: string;
  registration: string;
  status: string;
  condominium_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  status: string;
  condominium_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  status: 'good' | 'regular' | 'needs_repair' | 'na';
  observation: string;
}

export interface Checklist {
  id: string;
  vigilante_id: string;
  vigilante_name: string;
  motorcycle_id: string;
  motorcycle_plate: string;
  condominium_id?: string;
  type: string;
  
  face_photo?: string;
  
  tires_status?: string;
  tires_observation?: string;
  brakes_status?: string;
  brakes_observation?: string;
  engine_oil_status?: string;
  engine_oil_observation?: string;
  coolant_status?: string;
  coolant_observation?: string;
  lights_status?: string;
  lights_observation?: string;
  electrical_status?: string;
  electrical_observation?: string;
  suspension_status?: string;
  suspension_observation?: string;
  cleaning_status?: string;
  cleaning_observation?: string;
  leaks_status?: string;
  leaks_observation?: string;
  
  motorcycle_photos: string[];
  fuel_level: number;
  fuel_photos: string[];
  motorcycle_km: string;
  km_photos: string[];
  
  general_observations: string;
  damages: string;
  signature?: string;
  
  status: string;
  created_at: string;
  completed_at?: string;
  
  // For PDF generation compatibility with VehiclePhoto types
  vehicle_photos?: VehiclePhoto[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
