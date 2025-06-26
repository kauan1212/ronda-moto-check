
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X } from 'lucide-react';

interface VehiclePhoto {
  url: string;
  category: 'front' | 'back' | 'left' | 'right';
}

interface VehiclePhotosProps {
  photos: VehiclePhoto[];
  onCaptureClick: (category: 'front' | 'back' | 'left' | 'right') => void;
  onRemovePhoto: (index: number) => void;
}

const VehiclePhotos = ({ photos, onCaptureClick, onRemovePhoto }: VehiclePhotosProps) => {
  const categories = [
    { key: 'front' as const, label: 'Frente', color: 'bg-blue-500' },
    { key: 'back' as const, label: 'Trás', color: 'bg-green-500' },
    { key: 'left' as const, label: 'Lateral Esquerda', color: 'bg-yellow-500' },
    { key: 'right' as const, label: 'Lateral Direita', color: 'bg-purple-500' }
  ];

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.key === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.key === category)?.color || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Fotos do Veículo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {categories.map((category) => (
            <Button
              key={category.key}
              type="button"
              onClick={() => onCaptureClick(category.key)}
              className={`flex items-center gap-2 ${category.color} hover:opacity-90 text-white text-sm sm:text-base p-2 sm:p-3`}
            >
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              {category.label}
            </Button>
          ))}
        </div>
        
        {photos.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm sm:text-base">Fotos Capturadas:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <div className={`absolute -top-2 left-2 px-2 py-1 rounded text-xs text-white z-10 ${getCategoryColor(photo.category)}`}>
                    {getCategoryLabel(photo.category)}
                  </div>
                  <img 
                    src={photo.url} 
                    alt={`Veículo ${getCategoryLabel(photo.category)}`} 
                    className="w-full h-24 sm:h-32 object-cover rounded-lg border"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehiclePhotos;
