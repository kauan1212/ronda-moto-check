
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X } from 'lucide-react';

interface FuelSectionProps {
  fuelLevel: number;
  fuelPhotos: string[];
  onFuelLevelChange: (value: number) => void;
  onCaptureClick: () => void;
  onRemovePhoto: (index: number) => void;
}

const FuelSection = ({ 
  fuelLevel, 
  fuelPhotos, 
  onFuelLevelChange, 
  onCaptureClick, 
  onRemovePhoto 
}: FuelSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Combustível</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="fuel_level">Nível de Combustível (%)</Label>
          <Input
            type="number"
            value={fuelLevel}
            onChange={(e) => onFuelLevelChange(parseInt(e.target.value) || 0)}
            min="0"
            max="100"
            placeholder="Nível em porcentagem"
          />
        </div>
        
        <Button
          type="button"
          onClick={onCaptureClick}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Foto do Combustível
        </Button>
        
        {fuelPhotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fuelPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img 
                  src={photo} 
                  alt={`Combustível ${index + 1}`} 
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  onClick={() => onRemovePhoto(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FuelSection;
