
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
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
