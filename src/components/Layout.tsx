
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}

const Layout = ({ children, title, onBack }: LayoutProps) => {
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button 
                  onClick={onBack}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
              <div className="flex items-center">
                <img 
                  src="/placeholder.svg" 
                  alt="Logo" 
                  className="h-8 w-8 rounded"
                />
                <h1 className="text-xl font-bold text-slate-800 ml-3">
                  {title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {profile && (
                <span className="text-sm text-slate-600 mr-2">
                  {profile.full_name} ({profile.role})
                </span>
              )}
              
              <Button 
                onClick={() => window.location.href = '/vigilante-checklist'}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                size="sm"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Área do Vigilante</span>
                <span className="sm:hidden">Vigilante</span>
              </Button>
              
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;
