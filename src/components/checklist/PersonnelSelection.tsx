
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { Vigilante, Motorcycle } from '@/types';

interface PersonnelSelectionProps {
  vigilantes: Vigilante[];
  motorcycles: Motorcycle[];
  vigilanteId: string;
  motorcycleId: string;
  type: 'start' | 'end';
  condominiumId: string;
  onVigilanteChange: (value: string) => void;
  onMotorcycleChange: (value: string) => void;
  onTypeChange: (value: 'start' | 'end') => void;
}

const PersonnelSelection = ({
  vigilantes,
  motorcycles,
  vigilanteId,
  motorcycleId,
  type,
  condominiumId,
  onVigilanteChange,
  onMotorcycleChange,
  onTypeChange
}: PersonnelSelectionProps) => {
  // Filter vigilantes and motorcycles by condominium
  const filteredVigilantes = vigilantes.filter(v => v.condominium_id === condominiumId);
  const filteredMotorcycles = motorcycles.filter(m => m.condominium_id === condominiumId);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Seleção do Vigilante e Motocicleta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vigilante">Vigilante</Label>
            <Select value={vigilanteId} onValueChange={onVigilanteChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o vigilante" />
              </SelectTrigger>
              <SelectContent>
                {filteredVigilantes.map((vigilante) => (
                  <SelectItem key={vigilante.id} value={vigilante.id}>
                    {vigilante.name} - {vigilante.registration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="motorcycle">Motocicleta</Label>
            <Select value={motorcycleId} onValueChange={onMotorcycleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a motocicleta" />
              </SelectTrigger>
              <SelectContent>
                {filteredMotorcycles.map((motorcycle) => (
                  <SelectItem key={motorcycle.id} value={motorcycle.id}>
                    {motorcycle.plate} - {motorcycle.brand} {motorcycle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="type">Tipo de Checklist</Label>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Início de Turno</SelectItem>
              <SelectItem value="end">Fim de Turno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonnelSelection;
