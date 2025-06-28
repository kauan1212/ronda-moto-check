
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  account_status: 'pending' | 'active' | 'frozen';
  approved_by: string | null;
  approved_at: string | null;
  frozen_by: string | null;
  frozen_at: string | null;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  isAdmin: boolean;
}

export interface UpdateUserData {
  userId: string;
  fullName: string;
  isAdmin: boolean;
}

export interface AccountStatusData {
  userId: string;
  status: 'active' | 'frozen';
  adminId: string;
}
