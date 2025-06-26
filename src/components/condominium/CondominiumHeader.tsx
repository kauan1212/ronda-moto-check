
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CondominiumHeaderProps {
  onAddClick: () => void;
}

const CondominiumHeader = ({ onAddClick }: CondominiumHeaderProps) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex items-center justify-center flex-1">
          <img 
            src="/lovable-uploads/2c80dbd7-a4ae-44cb-ad84-3b14b0d68244.png" 
            alt="Grupo Celdan Facilities" 
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg shadow-lg"
          />
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 ml-2 sm:ml-4">
            Sistema de Vigilância
          </h1>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
      <p className="text-lg sm:text-xl text-slate-600 mb-4 px-2">
        Gerencie e selecione o condomínio para acessar o painel administrativo
      </p>
      
      <div className="flex justify-center mb-6">
        <Button onClick={onAddClick} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Condomínio
        </Button>
      </div>
    </div>
  );
};

export default CondominiumHeader;
