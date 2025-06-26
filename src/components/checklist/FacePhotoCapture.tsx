
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';

interface FacePhotoCaptureProps {
  facePhoto: string;
  onCaptureClick: () => void;
}

const FacePhotoCapture = ({ facePhoto, onCaptureClick }: FacePhotoCaptureProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto Facial do Vigilante</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={onCaptureClick}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Capturar Foto Facial
          </Button>
          {facePhoto && (
            <div className="text-green-600 text-sm">✓ Foto capturada</div>
          )}
        </div>
        {facePhoto && (
          <div className="mt-4">
            <img 
              src={facePhoto} 
              alt="Foto facial" 
              className="w-32 h-32 object-cover rounded-lg border"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacePhotoCapture;
