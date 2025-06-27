
import { useState } from 'react';
import { toast } from 'sonner';
import { VehiclePhoto } from '@/types/checklist';

export const usePhotoHandling = () => {
  const [showFaceCamera, setShowFaceCamera] = useState(false);
  const [showVehicleCamera, setShowVehicleCamera] = useState(false);
  const [currentVehiclePhotoCategory, setCurrentVehiclePhotoCategory] = useState<'front' | 'back' | 'left' | 'right' | 'additional'>('front');
  const [showFuelCamera, setShowFuelCamera] = useState(false);
  const [showKmCamera, setShowKmCamera] = useState(false);

  const handlePhotoCapture = (
    photo: string, 
    type: 'face' | 'vehicle' | 'fuel' | 'km',
    formData: any,
    updateFormData: (updates: any) => void
  ) => {
    console.log('Foto capturada para:', type);
    switch (type) {
      case 'face':
        updateFormData({ face_photo: photo });
        setShowFaceCamera(false);
        break;
      case 'vehicle':
        const newVehiclePhoto: VehiclePhoto = {
          url: photo,
          category: currentVehiclePhotoCategory
        };
        updateFormData({ vehicle_photos: [...formData.vehicle_photos, newVehiclePhoto] });
        setShowVehicleCamera(false);
        break;
      case 'fuel':
        updateFormData({ fuel_photos: [...formData.fuel_photos, photo] });
        setShowFuelCamera(false);
        break;
      case 'km':
        updateFormData({ km_photos: [...formData.km_photos, photo] });
        setShowKmCamera(false);
        break;
    }
  };

  const removePhoto = (
    index: number, 
    type: 'vehicle' | 'fuel' | 'km',
    formData: any,
    updateFormData: (updates: any) => void
  ) => {
    switch (type) {
      case 'vehicle':
        updateFormData({ vehicle_photos: formData.vehicle_photos.filter((_: any, i: number) => i !== index) });
        break;
      case 'fuel':
        updateFormData({ fuel_photos: formData.fuel_photos.filter((_: any, i: number) => i !== index) });
        break;
      case 'km':
        updateFormData({ km_photos: formData.km_photos.filter((_: any, i: number) => i !== index) });
        break;
    }
  };

  const handleVehiclePhotoCapture = (category: 'front' | 'back' | 'left' | 'right' | 'additional') => {
    setCurrentVehiclePhotoCategory(category);
    setShowVehicleCamera(true);
  };

  return {
    showFaceCamera,
    setShowFaceCamera,
    showVehicleCamera,
    setShowVehicleCamera,
    currentVehiclePhotoCategory,
    showFuelCamera,
    setShowFuelCamera,
    showKmCamera,
    setShowKmCamera,
    handlePhotoCapture,
    removePhoto,
    handleVehiclePhotoCapture
  };
};
