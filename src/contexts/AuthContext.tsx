
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de usuário do localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular autenticação
    if (email === 'admin@condominio.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        name: 'Administrador',
        email: 'admin@condominio.com',
        role: 'admin',
        registration: 'ADM-001',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }
    
    if (email === 'vigilante@condominio.com' && password === 'vigilante123') {
      const vigilanteUser: User = {
        id: '2',
        name: 'João Silva',
        email: 'vigilante@condominio.com',
        role: 'vigilante',
        registration: 'VIG-001',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setUser(vigilanteUser);
      localStorage.setItem('user', JSON.stringify(vigilanteUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
