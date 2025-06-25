
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Save, User, Bike, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Motorcycle, Condominium } from '@/types';
import { toast } from 'sonner';
import CameraCapture from './CameraCapture';
import SignatureCapture from './SignatureCapture';
import Layout from './Layout';

interface ChecklistFormProps {
  onBack: () => void;
}

const ChecklistForm = ({ onBack }: ChecklistFormProps) => {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string>('');
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [formData, setFormData] = useState({
    vigilante_id: '',
    motorcycle_id: '',
    type: 'start' as 'start' | 'end',
    face_photo: '',
    tires_status: '',
    tires_observation: '',
    brakes_status: '',
    brakes_observation: '',
    engine_oil_status: '',
    engine_oil_observation: '',
    coolant_status: '',
    coolant_observation: '',
    lights_status: '',
    lights_observation: '',
    electrical_status: '',
    electrical_observation: '',
    suspension_status: '',
    suspension_observation: '',
    cleaning_status: '',
    cleaning_observation: '',
    leaks_status: '',
    leaks_observation: '',
    motorcycle_photos: [] as string[],
    fuel_level: 0,
    fuel_photos: [] as string[],
    motorcycle_km: '',
    km_photos: [] as string[],
    general_observations: '',
    damages: '',
    signature: ''
  });

  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'face' | 'motorcycle' | 'fuel' | 'km'>('face');
  const [showSignature, setShowSignature] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCondominiums();
  }, []);

  useEffect(() => {
    if (selectedCondominiumId) {
      fetchVigilantesAndMotorcycles();
    }
  }, [selectedCondominiumId]);

  const fetchCondominiums = async () => {
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .order('name');

      if (error) throw error;
      setCondominiums(data || []);
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error);
      toast.error('Erro ao carregar condomínios');
    }
  };

  const fetchVigilantesAndMotorcycles = async () => {
    try {
      const [vigilantesResponse, motorcyclesResponse] = await Promise.all([
        supabase
          .from('vigilantes')
          .select('*')
          .eq('condominium_id', selectedCondominiumId)
          .eq('status', 'active'),
        supabase
          .from('motorcycles')
          .select('*')
          .eq('condominium_id', selectedCondominiumId)
          .eq('status', 'available')
      ]);

      if (vigilantesResponse.error) throw vigilantesResponse.error;
      if (motorcyclesResponse.error) throw motorcyclesResponse.error;

      setVigilantes(vigilantesResponse.data || []);
      setMotorcycles(motorcyclesResponse.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar vigilantes e motocicletas');
    }
  };

  const openCamera = (type: 'face' | 'motorcycle' | 'fuel' | 'km') => {
    setCameraType(type);
    setShowCamera(true);
  };

  const handlePhotoCapture = (imageData: string) => {
    switch (cameraType) {
      case 'face':
        setFormData(prev => ({ ...prev, face_photo: imageData }));
        break;
      case 'motorcycle':
        setFormData(prev => ({ 
          ...prev, 
          motorcycle_photos: [...prev.motorcycle_photos, imageData] 
        }));
        break;
      case 'fuel':
        setFormData(prev => ({ 
          ...prev, 
          fuel_photos: [...prev.fuel_photos, imageData] 
        }));
        break;
      case 'km':
        setFormData(prev => ({ 
          ...prev, 
          km_photos: [...prev.km_photos, imageData] 
        }));
        break;
    }
    setShowCamera(false);
    toast.success('Foto capturada com sucesso!');
  };

  const handleSignatureCapture = (signatureData: string) => {
    setFormData(prev => ({ ...prev, signature: signatureData }));
    setShowSignature(false);
    toast.success('Assinatura capturada com sucesso!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedCondominiumId || !formData.vigilante_id || !formData.motorcycle_id) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const selectedVigilante = vigilantes.find(v => v.id === formData.vigilante_id);
      const selectedMotorcycle = motorcycles.find(m => m.id === formData.motorcycle_id);

      if (!selectedVigilante || !selectedMotorcycle) {
        toast.error('Vigilante ou motocicleta não encontrados');
        return;
      }

      const checklistData = {
        ...formData,
        condominium_id: selectedCondominiumId,
        vigilante_name: selectedVigilante.name,
        motorcycle_plate: selectedMotorcycle.plate,
        status: 'completed',
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('checklists')
        .insert([checklistData]);

      if (error) throw error;

      toast.success('Checklist salvo com sucesso!');
      
      // Reset form
      setFormData({
        vigilante_id: '',
        motorcycle_id: '',
        type: 'start',
        face_photo: '',
        tires_status: '',
        tires_observation: '',
        brakes_status: '',
        brakes_observation: '',
        engine_oil_status: '',
        engine_oil_observation: '',
        coolant_status: '',
        coolant_observation: '',
        lights_status: '',
        lights_observation: '',
        electrical_status: '',
        electrical_observation: '',
        suspension_status: '',
        suspension_observation: '',
        cleaning_status: '',
        cleaning_observation: '',
        leaks_status: '',
        leaks_observation: '',
        motorcycle_photos: [],
        fuel_level: 0,
        fuel_photos: [],
        motorcycle_km: '',
        km_photos: [],
        general_observations: '',
        damages: '',
        signature: ''
      });
      setSelectedCondominiumId('');
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast.error('Erro ao salvar checklist');
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'regular':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'needs_repair':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handlePhotoCapture}
        onCancel={() => setShowCamera(false)}
        title={
          cameraType === 'face' ? 'Foto Facial' :
          cameraType === 'motorcycle' ? 'Foto da Motocicleta' :
          cameraType === 'fuel' ? 'Foto do Combustível' : 'Foto do Hodômetro'
        }
      />
    );
  }

  if (showSignature) {
    return (
      <SignatureCapture
        onCapture={handleSignatureCapture}
        onCancel={() => setShowSignature(false)}
      />
    );
  }

  return (
    <Layout title="Checklist de Vistoria" onBack={onBack}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Seleção de Condomínio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2" />
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="condominium">Condomínio *</Label>
              <Select 
                value={selectedCondominiumId} 
                onValueChange={setSelectedCondominiumId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o condomínio" />
                </SelectTrigger>
                <SelectContent>
                  {condominiums.map((condo) => (
                    <SelectItem key={condo.id} value={condo.id}>
                      {condo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCondominiumId && (
              <>
                <div>
                  <Label htmlFor="vigilante">Vigilante *</Label>
                  <Select 
                    value={formData.vigilante_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vigilante_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o vigilante" />
                    </SelectTrigger>
                    <SelectContent>
                      {vigilantes.map((vigilante) => (
                        <SelectItem key={vigilante.id} value={vigilante.id}>
                          {vigilante.name} - {vigilante.registration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="motorcycle">Motocicleta *</Label>
                  <Select 
                    value={formData.motorcycle_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, motorcycle_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a motocicleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {motorcycles.map((motorcycle) => (
                        <SelectItem key={motorcycle.id} value={motorcycle.id}>
                          {motorcycle.plate} - {motorcycle.brand} {motorcycle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Vistoria *</Label>
                  <RadioGroup 
                    value={formData.type} 
                    onValueChange={(value: 'start' | 'end') => setFormData(prev => ({ ...prev, type: value }))}
                    className="flex flex-col sm:flex-row gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="start" id="start" />
                      <Label htmlFor="start">Início do Turno</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="end" id="end" />
                      <Label htmlFor="end">Fim do Turno</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Foto Facial</Label>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                      type="button"
                      onClick={() => openCamera('face')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {formData.face_photo ? 'Refazer Foto' : 'Tirar Foto'}
                    </Button>
                    {formData.face_photo && (
                      <div className="w-full sm:w-20 h-20 border rounded-lg overflow-hidden">
                        <img 
                          src={formData.face_photo} 
                          alt="Foto facial" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Resto dos campos só aparece se condomínio for selecionado */}
        {selectedCondominiumId && (
          <>
            {/* Verificação de Itens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bike className="h-5 w-5 mr-2" />
                  Verificação de Itens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'tires', label: 'Pneus' },
                  { key: 'brakes', label: 'Freios' },
                  { key: 'engine_oil', label: 'Óleo do Motor' },
                  { key: 'coolant', label: 'Líquido de Arrefecimento' },
                  { key: 'lights', label: 'Luzes' },
                  { key: 'electrical', label: 'Sistema Elétrico' },
                  { key: 'suspension', label: 'Suspensão' },
                  { key: 'cleaning', label: 'Limpeza' },
                  { key: 'leaks', label: 'Vazamentos' }
                ].map((item) => (
                  <div key={item.key} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">{item.label}</Label>
                      <StatusIcon status={formData[`${item.key}_status` as keyof typeof formData] as string} />
                    </div>
                    <RadioGroup 
                      value={formData[`${item.key}_status` as keyof typeof formData] as string}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        [`${item.key}_status`]: value 
                      }))}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="good" id={`${item.key}-good`} />
                        <Label htmlFor={`${item.key}-good`} className="text-green-700">Bom</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regular" id={`${item.key}-regular`} />
                        <Label htmlFor={`${item.key}-regular`} className="text-yellow-700">Regular</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="needs_repair" id={`${item.key}-repair`} />
                        <Label htmlFor={`${item.key}-repair`} className="text-red-700">Precisa Reparo</Label>
                      </div>
                    </RadioGroup>
                    <Textarea
                      placeholder="Observações (opcional)"
                      value={formData[`${item.key}_observation` as keyof typeof formData] as string}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        [`${item.key}_observation`]: e.target.value 
                      }))}
                      className="mt-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fotos e Medições */}
            <Card>
              <CardHeader>
                <CardTitle>Fotos e Medições</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fotos da Motocicleta */}
                <div>
                  <Label>Fotos da Motocicleta</Label>
                  <div className="flex flex-col gap-3 mt-2">
                    <Button
                      type="button"
                      onClick={() => openCamera('motorcycle')}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Adicionar Foto
                    </Button>
                    {formData.motorcycle_photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {formData.motorcycle_photos.map((photo, index) => (
                          <div key={index} className="w-full h-20 border rounded-lg overflow-hidden">
                            <img 
                              src={photo} 
                              alt={`Motocicleta ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Combustível */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fuel_level">Nível de Combustível (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.fuel_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, fuel_level: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Foto do Combustível</Label>
                    <div className="flex gap-3 mt-1">
                      <Button
                        type="button"
                        onClick={() => openCamera('fuel')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Foto
                      </Button>
                      {formData.fuel_photos.length > 0 && (
                        <div className="w-12 h-12 border rounded overflow-hidden">
                          <img 
                            src={formData.fuel_photos[0]} 
                            alt="Combustível" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quilometragem */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="motorcycle_km">Quilometragem</Label>
                    <Input
                      value={formData.motorcycle_km}
                      onChange={(e) => setFormData(prev => ({ ...prev, motorcycle_km: e.target.value }))}
                      placeholder="Ex: 12.345"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Foto do Hodômetro</Label>
                    <div className="flex gap-3 mt-1">
                      <Button
                        type="button"
                        onClick={() => openCamera('km')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Foto
                      </Button>
                      {formData.km_photos.length > 0 && (
                        <div className="w-12 h-12 border rounded overflow-hidden">
                          <img 
                            src={formData.km_photos[0]} 
                            alt="Hodômetro" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações e Assinatura */}
            <Card>
              <CardHeader>
                <CardTitle>Observações e Assinatura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="general_observations">Observações Gerais</Label>
                  <Textarea
                    id="general_observations"
                    value={formData.general_observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, general_observations: e.target.value }))}
                    placeholder="Observações gerais sobre a vistoria"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="damages">Danos ou Problemas</Label>
                  <Textarea
                    id="damages"
                    value={formData.damages}
                    onChange={(e) => setFormData(prev => ({ ...prev, damages: e.target.value }))}
                    placeholder="Descreva qualquer dano ou problema encontrado"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Assinatura</Label>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                      type="button"
                      onClick={() => setShowSignature(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      {formData.signature ? 'Refazer Assinatura' : 'Assinar'}
                    </Button>
                    {formData.signature && (
                      <div className="w-full sm:w-32 h-20 border rounded-lg overflow-hidden bg-white">
                        <img 
                          src={formData.signature} 
                          alt="Assinatura" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão de Salvar */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  disabled={loading}
                >
                  <Save className="h-5 w-5 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Checklist'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </form>
    </Layout>
  );
};

export default ChecklistForm;
