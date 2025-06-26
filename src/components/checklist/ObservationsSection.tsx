
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ObservationsSectionProps {
  generalObservations: string;
  damages: string;
  onGeneralObservationsChange: (value: string) => void;
  onDamagesChange: (value: string) => void;
}

const ObservationsSection = ({ 
  generalObservations, 
  damages, 
  onGeneralObservationsChange, 
  onDamagesChange 
}: ObservationsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Observações Gerais e Danos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="general_observations">Observações Gerais</Label>
          <Textarea
            value={generalObservations}
            onChange={(e) => onGeneralObservationsChange(e.target.value)}
            placeholder="Observações gerais sobre a vistoria..."
            rows={4}
          />
        </div>
        
        <div>
          <Label htmlFor="damages">Danos ou Problemas Identificados</Label>
          <Textarea
            value={damages}
            onChange={(e) => onDamagesChange(e.target.value)}
            placeholder="Descreva qualquer dano ou problema encontrado..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ObservationsSection;
