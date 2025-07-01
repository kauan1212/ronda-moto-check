
import React, { useState } from 'react';
import CameraCapture from './CameraCapture';
import SignatureCapture from './SignatureCapture';

// Import all the checklist components
import ChecklistHeader from './checklist/ChecklistHeader';
import PersonnelSelection from './checklist/PersonnelSelection';
import FacePhotoCapture from './checklist/FacePhotoCapture';
import InspectionItems from './checklist/InspectionItems';
import VehiclePhotos from './checklist/VehiclePhotos';
import FuelSection from './checklist/FuelSection';
import KilometerSection from './checklist/KilometerSection';
import ObservationsSection from './checklist/ObservationsSection';
import SignatureSection from './checklist/SignatureSection';
import ChecklistActions from './checklist/ChecklistActions';

// Import custom hooks
import { useChecklistForm } from '@/hooks/useChecklistForm';
import { useChecklistData } from '@/hooks/useChecklistData';
import { usePhotoHandling } from '@/hooks/usePhotoHandling';
import { useChecklistOperations } from '@/hooks/useChecklistOperations';

interface ChecklistFormProps {
  onComplete: () => void;
  condominiumId?: string;
}

const ChecklistForm = ({ onComplete, condominiumId }: ChecklistFormProps) => {
  const [showSignature, setShowSignature] = useState(false);
  
  const { formData, updateFormData, resetForm } = useChecklistForm();
  const { vigilantes, motorcycles } = useChecklistData();
  const { isSaving, handleSave, handleGeneratePDF } = useChecklistOperations();
  
  const {
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
  } = usePhotoHandling();

  // Não resetar automaticamente após salvar
  const onSave = () => handleSave(formData, vigilantes, motorcycles);
  const onGeneratePDF = () => handleGeneratePDF(formData, vigilantes, motorcycles);

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <ChecklistHeader />

      <PersonnelSelection
        vigilantes={vigilantes}
        motorcycles={motorcycles}
        vigilanteId={formData.vigilante_id}
        motorcycleId={formData.motorcycle_id}
        type={formData.type}
        condominiumId={condominiumId || ''}
        onVigilanteChange={(value) => updateFormData({ vigilante_id: value })}
        onMotorcycleChange={(value) => updateFormData({ motorcycle_id: value })}
        onTypeChange={(value) => updateFormData({ type: value })}
      />

      <FacePhotoCapture
        facePhoto={formData.face_photo}
        onCaptureClick={() => setShowFaceCamera(true)}
      />

      <InspectionItems
        formData={formData}
        onFormDataChange={updateFormData}
      />

      <VehiclePhotos
        photos={formData.vehicle_photos}
        onCaptureClick={handleVehiclePhotoCapture}
        onRemovePhoto={(index) => removePhoto(index, 'vehicle', formData, updateFormData)}
      />

      <FuelSection
        fuelPhotos={formData.fuel_photos}
        onCaptureClick={() => setShowFuelCamera(true)}
        onRemovePhoto={(index) => removePhoto(index, 'fuel', formData, updateFormData)}
      />

      <KilometerSection
        motorcycleKm={formData.motorcycle_km}
        kmPhotos={formData.km_photos}
        onKmChange={(value) => updateFormData({ motorcycle_km: value })}
        onCaptureClick={() => setShowKmCamera(true)}
        onRemovePhoto={(index) => removePhoto(index, 'km', formData, updateFormData)}
      />

      <ObservationsSection
        generalObservations={formData.general_observations}
        damages={formData.damages}
        onGeneralObservationsChange={(value) => updateFormData({ general_observations: value })}
        onDamagesChange={(value) => updateFormData({ damages: value })}
      />

      <SignatureSection
        signature={formData.signature}
        onCaptureClick={() => setShowSignature(true)}
      />

      <ChecklistActions
        onSave={onSave}
        onGeneratePDF={onGeneratePDF}
        isSaving={isSaving}
        canSave={!!(formData.vigilante_id && formData.motorcycle_id && formData.signature)}
        canGeneratePDF={!!(formData.vigilante_id && formData.motorcycle_id)}
      />

      {/* Câmeras e Assinatura */}
      {showFaceCamera && (
        <CameraCapture
          onCapture={(photo) => handlePhotoCapture(photo, 'face', formData, updateFormData)}
          onCancel={() => setShowFaceCamera(false)}
          title="Capturar Foto Facial"
        />
      )}

      {showVehicleCamera && (
        <CameraCapture
          onCapture={(photo) => handlePhotoCapture(photo, 'vehicle', formData, updateFormData)}
          onCancel={() => setShowVehicleCamera(false)}
          title={`Capturar Foto do Veículo - ${currentVehiclePhotoCategory === 'front' ? 'Frente' : 
                  currentVehiclePhotoCategory === 'back' ? 'Trás' : 
                  currentVehiclePhotoCategory === 'left' ? 'Lateral Esquerda' : 
                  currentVehiclePhotoCategory === 'right' ? 'Lateral Direita' : 'Foto Adicional'}`}
        />
      )}

      {showFuelCamera && (
        <CameraCapture
          onCapture={(photo) => handlePhotoCapture(photo, 'fuel', formData, updateFormData)}
          onCancel={() => setShowFuelCamera(false)}
          title="Capturar Foto do Combustível"
        />
      )}

      {showKmCamera && (
        <CameraCapture
          onCapture={(photo) => handlePhotoCapture(photo, 'km', formData, updateFormData)}
          onCancel={() => setShowKmCamera(false)}
          title="Capturar Foto do Odômetro"
        />
      )}

      {showSignature && (
        <SignatureCapture
          onCapture={(signature) => {
            updateFormData({ signature });
            setShowSignature(false);
          }}
          onCancel={() => setShowSignature(false)}
        />
      )}
    </div>
  );
};

export default ChecklistForm;
