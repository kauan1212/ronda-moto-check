
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Plus, RefreshCw } from 'lucide-react';

interface CondominiumHeaderProps {
  onAddClick: () => void;
  onRefresh?: () => void;
}

const CondominiumHeader = ({ onAddClick, onRefresh }: CondominiumHeaderProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Meus Condomínios
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Gerencie seus condomínios cadastrados
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          )}
          
          <Button 
            onClick={onAddClick}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Condomínio</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CondominiumHeader;
