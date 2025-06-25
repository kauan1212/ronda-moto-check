
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vigilante';
  registration: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Vigilante {
  id: string;
  name: string;
  email: string;
  registration: string;
  status: 'active' | 'inactive';
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
  status: 'available' | 'in_use' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  status: 'good' | 'regular' | 'needs_repair';
  observation: string;
}

export interface Checklist {
  id: string;
  vigilante_id: string;
  vigilante_name: string;
  motorcycle_id: string;
  motorcycle_plate: string;
  type: 'start' | 'end';
  
  face_photo?: string;
  
  tires_status?: 'good' | 'regular' | 'needs_repair';
  tires_observation?: string;
  brakes_status?: 'good' | 'regular' | 'needs_repair';
  brakes_observation?: string;
  engine_oil_status?: 'good' | 'regular' | 'needs_repair';
  engine_oil_observation?: string;
  coolant_status?: 'good' | 'regular' | 'needs_repair';
  coolant_observation?: string;
  lights_status?: 'good' | 'regular' | 'needs_repair';
  lights_observation?: string;
  electrical_status?: 'good' | 'regular' | 'needs_repair';
  electrical_observation?: string;
  suspension_status?: 'good' | 'regular' | 'needs_repair';
  suspension_observation?: string;
  cleaning_status?: 'good' | 'regular' | 'needs_repair';
  cleaning_observation?: string;
  leaks_status?: 'good' | 'regular' | 'needs_repair';
  leaks_observation?: string;
  
  motorcycle_photos: string[];
  fuel_level: number;
  fuel_photos: string[];
  motorcycle_km: string;
  km_photos: string[];
  
  general_observations: string;
  damages: string;
  signature?: string;
  
  status: 'pending' | 'completed' | 'sent';
  created_at: string;
  completed_at?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
