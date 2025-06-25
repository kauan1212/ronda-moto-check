
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vigilante';
  registration: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  status: 'available' | 'in_use' | 'maintenance';
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  checked: boolean;
  observation?: string;
}

export interface Checklist {
  id: string;
  vigilanteId: string;
  vigilanteName: string;
  motorcycleId: string;
  motorcyclePlate: string;
  type: 'start' | 'end';
  items: ChecklistItem[];
  facePhoto?: string;
  motorcyclePhotos: string[];
  signature?: string;
  generalObservations: string;
  damages: string;
  fuelLevel: number;
  status: 'pending' | 'completed' | 'sent';
  createdAt: string;
  completedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
