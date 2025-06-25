
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Motorcycle } from '@/types';

interface MotorcycleListProps {
  motorcycles: Motorcycle[];
  onEdit: (motorcycle: Motorcycle) => void;
  onDelete: (motorcycle: Motorcycle) => void;
}

const MotorcycleList = ({ motorcycles, onEdit, onDelete }: MotorcycleListProps) => {
  return (
    <CardContent>
      <div className="space-y-3">
        {motorcycles.map((motorcycle) => (
          <div key={motorcycle.id} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-medium">{motorcycle.plate}</p>
              <p className="text-sm text-gray-600">
                {motorcycle.brand} {motorcycle.model} {motorcycle.year}
              </p>
              <p className="text-xs text-gray-500">Cor: {motorcycle.color}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  motorcycle.status === 'available' ? 'default' : 
                  motorcycle.status === 'in_use' ? 'secondary' : 'destructive'
                }
              >
                {motorcycle.status === 'available' ? 'Disponível' : 
                 motorcycle.status === 'in_use' ? 'Em Uso' : 'Manutenção'}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit(motorcycle)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDelete(motorcycle)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {motorcycles.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Nenhuma motocicleta encontrada
          </p>
        )}
      </div>
    </CardContent>
  );
};

export default MotorcycleList;
