
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Vigilante } from '@/types';
import VigilanteItem from './VigilanteItem';

interface VigilanteListProps {
  vigilantes: Vigilante[];
  onEdit: (vigilante: Vigilante) => void;
  onDelete: (vigilante: Vigilante) => void;
}

const VigilanteList = ({ vigilantes, onEdit, onDelete }: VigilanteListProps) => {
  return (
    <CardContent>
      <div className="space-y-3">
        {vigilantes.map((vigilante) => (
          <VigilanteItem
            key={vigilante.id}
            vigilante={vigilante}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {vigilantes.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Nenhum vigilante encontrado
          </p>
        )}
      </div>
    </CardContent>
  );
};

export default VigilanteList;
