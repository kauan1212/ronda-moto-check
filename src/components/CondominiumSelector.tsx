
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { Condominium } from '@/types';

interface CondominiumSelectorProps {
  condominiums: Condominium[];
  selectedId: string;
  onSelect: (condominium: Condominium) => void;
  loading: boolean;
}

const CondominiumSelector = ({ condominiums, selectedId, onSelect, loading }: CondominiumSelectorProps) => {
  const handleValueChange = (value: string) => {
    const selectedCondominium = condominiums.find(c => c.id === value);
    if (selectedCondominium) {
      onSelect(selectedCondominium);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Carregando condomínios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Selecione um condomínio:</label>
      <Select value={selectedId} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Escolha um condomínio para gerenciar" />
        </SelectTrigger>
        <SelectContent>
          {condominiums.map((condominium) => (
            <SelectItem key={condominium.id} value={condominium.id}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {condominium.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CondominiumSelector;
