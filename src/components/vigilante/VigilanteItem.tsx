
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Vigilante } from '@/types';

interface VigilanteItemProps {
  vigilante: Vigilante;
  onEdit: (vigilante: Vigilante) => void;
  onDelete: (vigilante: Vigilante) => void;
}

const VigilanteItem = ({ vigilante, onEdit, onDelete }: VigilanteItemProps) => {
  return (
    <div className="flex justify-between items-center p-3 border rounded-lg">
      <div>
        <p className="font-medium">{vigilante.name}</p>
        <p className="text-sm text-gray-600">{vigilante.email}</p>
        <p className="text-xs text-gray-500">Registro: {vigilante.registration}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={vigilante.status === 'active' ? 'default' : 'secondary'}>
          {vigilante.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onEdit(vigilante)}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onDelete(vigilante)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default VigilanteItem;
