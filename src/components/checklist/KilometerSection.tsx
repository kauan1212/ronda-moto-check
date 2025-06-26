
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X } from 'lucide-react';

interface KilometerSectionProps {
  motorcycleKm: string;
  kmPhotos: string[];
  onKmChange: (value: string) => void;
  onCaptureClick: () => void;
  onRemovePhoto: (index: number) => void;
}

const KilometerSection = ({ 
  motorcycleKm, 
  kmPhotos, 
  onKmChange, 
  onCaptureClick, 
  onRemovePhoto 
}: KilometerSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quilometragem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="motorcycle_km">Quilometragem Atual</Label>
          <Input
            type="text"
            value={motorcycleKm}
            onChange={(e) => onKmChange(e.target.value)}
            placeholder="Ex: 12.345 km"
          />
        </div>
        
        <Button
          type="button"
          onClick={onCaptureClick}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Foto do Odômetro
        </Button>
        
        {kmPhotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kmPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img 
                  src={photo} 
                  alt={`Odômetro ${index + 1}`} 
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

export default KilometerSection;
