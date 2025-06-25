
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
  status: string; // Changed from literal union to string
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
  status: string; // Changed from literal union to string
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
  type: string; // Changed from literal union to string
  
  face_photo?: string;
  
  tires_status?: string; // Changed from literal union to string
  tires_observation?: string;
  brakes_status?: string; // Changed from literal union to string
  brakes_observation?: string;
  engine_oil_status?: string; // Changed from literal union to string
  engine_oil_observation?: string;
  coolant_status?: string; // Changed from literal union to string
  coolant_observation?: string;
  lights_status?: string; // Changed from literal union to string
  lights_observation?: string;
  electrical_status?: string; // Changed from literal union to string
  electrical_observation?: string;
  suspension_status?: string; // Changed from literal union to string
  suspension_observation?: string;
  cleaning_status?: string; // Changed from literal union to string
  cleaning_observation?: string;
  leaks_status?: string; // Changed from literal union to string
  leaks_observation?: string;
  
  motorcycle_photos: string[];
  fuel_level: number;
  fuel_photos: string[];
  motorcycle_km: string;
  km_photos: string[];
  
  general_observations: string;
  damages: string;
  signature?: string;
  
  status: string; // Changed from literal union to string
  created_at: string;
  completed_at?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
