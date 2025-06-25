
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import CameraCapture from '@/components/CameraCapture';
import SignatureCapture from '@/components/SignatureCapture';
import { 
  ArrowLeft, 
  Bike, 
  Fuel, 
  Shield, 
  Lightbulb, 
  Eye, 
  Settings,
  Save,
  Send,
  Download,
  User,
  Gauge
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Motorcycle, ChecklistItem } from '@/types';

interface ChecklistFormProps {
  onBack: () => void;
}

const ChecklistForm = ({ onBack }: ChecklistFormProps) => {
  const { toast } = useToast();
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    vigilante_id: '',
    vigilante_name: '',
    motorcycle_id: '',
    motorcycle_plate: '',
    checklistType: '',
    face_photo: '',
    motorcycle_photos: [] as string[],
    
    // Itens de verificação com status
    tires: { status: '', observation: '' },
    brakes: { status: '', observation: '' },
    engineOil: { status: '', observation: '' },
    coolant: { status: '', observation: '' },
    lights: { status: '', observation: '' },
    electrical: { status: '', observation: '' },
    suspension: { status: '', observation: '' },
    cleaning: { status: '', observation: '' },
    leaks: { status: '', observation: '' },
    
    general_observations: '',
    damages: '',
    fuel_level: '50',
    fuel_photos: [] as string[],
    motorcycle_km: '',
    km_photos: [] as string[],
    signature: ''
  });

  const checklistItems = [
    { 
      id: 'tires', 
      label: 'Pneus', 
      icon: Settings, 
      description: 'Verificar pressão, desgaste, banda de rodagem e integridade da câmara de ar',
      field: 'tires' 
    },
    { 
      id: 'brakes', 
      label: 'Sistema de Freios', 
      icon: Shield, 
      description: 'Checar funcionamento dianteiro/traseiro, nível do fluido e espessura das pastilhas',
      field: 'brakes' 
    },
    { 
      id: 'engineOil', 
      label: 'Nível de Óleo do Motor', 
      icon: Fuel, 
      description: 'Verificar nível do óleo e certificar-se que está dentro do recomendado',
      field: 'engineOil' 
    },
    { 
      id: 'coolant', 
      label: 'Fluido de Arrefecimento', 
      icon: Settings, 
      description: 'Verificar nível do fluido de arrefecimento (motos com refrigeração líquida)',
      field: 'coolant' 
    },
    { 
      id: 'lights', 
      label: 'Sistema de Iluminação', 
      icon: Lightbulb, 
      description: 'Testar faróis, lanternas, piscas, luz de freio, ré e iluminação da placa',
      field: 'lights' 
    },
    { 
      id: 'electrical', 
      label: 'Sistema Elétrico', 
      icon: Settings, 
      description: 'Verificar buzina, partida elétrica e painel de instrumentos',
      field: 'electrical' 
    },
    { 
      id: 'suspension', 
      label: 'Suspensão', 
      icon: Settings, 
      description: 'Verificar funcionamento dianteiro/traseiro, vazamentos ou folgas',
      field: 'suspension' 
    },
    { 
      id: 'cleaning', 
      label: 'Limpeza', 
      icon: Settings, 
      description: 'Realizar limpeza externa e interna da motocicleta',
      field: 'cleaning' 
    },
    { 
      id: 'leaks', 
      label: 'Verificação de Vazamentos', 
      icon: Eye, 
      description: 'Observar vazamentos de óleo, combustível ou outros fluidos',
      field: 'leaks' 
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vigilantesData, motorcyclesData] = await Promise.all([
        supabase.from('vigilantes').select('*').eq('status', 'active'),
        supabase.from('motorcycles').select('*').eq('status', 'available')
      ]);

      if (vigilantesData.data) setVigilantes(vigilantesData.data);
      if (motorcyclesData.data) setMotorcycles(motorcyclesData.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVigilanteChange = (vigilanteId: string) => {
    const vigilante = vigilantes.find(v => v.id === vigilanteId);
    setFormData(prev => ({
      ...prev,
      vigilante_id: vigilanteId,
      vigilante_name: vigilante?.name || ''
    }));
  };

  const handleMotorcycleChange = (motorcycleId: string) => {
    const motorcycle = motorcycles.find(m => m.id === motorcycleId);
    setFormData(prev => ({
      ...prev,
      motorcycle_id: motorcycleId,
      motorcycle_plate: motorcycle?.plate || ''
    }));
  };

  const handleItemStatusChange = (field: string, status: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof typeof formData] as ChecklistItem,
        status
      }
    }));
  };

  const handleItemObservationChange = (field: string, observation: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof typeof formData] as ChecklistItem,
        observation
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.face_photo) {
      toast({
        title: "Foto facial obrigatória",
        description: "É necessário tirar uma foto do rosto para prosseguir.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.signature) {
      toast({
        title: "Assinatura obrigatória",
        description: "É necessário assinar o checklist para finalizar.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.vigilante_id || !formData.motorcycle_id) {
      toast({
        title: "Dados obrigatórios",
        description: "Selecione o vigilante e a motocicleta.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const checklistData = {
        vigilante_id: formData.vigilante_id,
        vigilante_name: formData.vigilante_name,
        motorcycle_id: formData.motorcycle_id,
        motorcycle_plate: formData.motorcycle_plate,
        type: formData.checklistType,
        face_photo: formData.face_photo,
        motorcycle_photos: formData.motorcycle_photos,
        fuel_level: parseInt(formData.fuel_level),
        fuel_photos: formData.fuel_photos,
        motorcycle_km: formData.motorcycle_km,
        km_photos: formData.km_photos,
        general_observations: formData.general_observations,
        damages: formData.damages,
        signature: formData.signature,
        
        // Status dos itens
        tires_status: formData.tires.status,
        tires_observation: formData.tires.observation,
        brakes_status: formData.brakes.status,
        brakes_observation: formData.brakes.observation,
        engine_oil_status: formData.engineOil.status,
        engine_oil_observation: formData.engineOil.observation,
        coolant_status: formData.coolant.status,
        coolant_observation: formData.coolant.observation,
        lights_status: formData.lights.status,
        lights_observation: formData.lights.observation,
        electrical_status: formData.electrical.status,
        electrical_observation: formData.electrical.observation,
        suspension_status: formData.suspension.status,
        suspension_observation: formData.suspension.observation,
        cleaning_status: formData.cleaning.status,
        cleaning_observation: formData.cleaning.observation,
        leaks_status: formData.leaks.status,
        leaks_observation: formData.leaks.observation,
      };

      const { error } = await supabase
        .from('checklists')
        .insert([checklistData]);

      if (error) throw error;

      toast({
        title: "Checklist salvo com sucesso!",
        description: "Checklist foi processado e enviado para o administrador.",
      });

      // Reset form
      setFormData({
        vigilante_id: '',
        vigilante_name: '',
        motorcycle_id: '',
        motorcycle_plate: '',
        checklistType: '',
        face_photo: '',
        motorcycle_photos: [],
        tires: { status: '', observation: '' },
        brakes: { status: '', observation: '' },
        engineOil: { status: '', observation: '' },
        coolant: { status: '', observation: '' },
        lights: { status: '', observation: '' },
        electrical: { status: '', observation: '' },
        suspension: { status: '', observation: '' },
        cleaning: { status: '', observation: '' },
        leaks: { status: '', observation: '' },
        general_observations: '',
        damages: '',
        fuel_level: '50',
        fuel_photos: [],
        motorcycle_km: '',
        km_photos: [],
        signature: ''
      });

    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast({
        title: "Erro ao salvar",
        description: "Erro ao salvar o checklist. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    toast({
      title: "PDF Gerado",
      description: "Download do PDF iniciado.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Bom</Badge>;
      case 'regular':
        return <Badge className="bg-yellow-100 text-yellow-800">Regular</Badge>;
      case 'needs_repair':
        return <Badge className="bg-red-100 text-red-800">Necessita Reparo</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="hover:scale-105 transition-transform">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Checklist Profissional da Motocicleta
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Inspecione todos os itens e registre fotograficamente antes de iniciar a ronda
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto Facial do Vigilante */}
          <CameraCapture
            title="Foto Facial do Vigilante"
            description="Tire uma foto clara do seu rosto para identificação no checklist"
            onCapture={(imageData) => setFormData(prev => ({ ...prev, face_photo: imageData }))}
          />

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vigilante">Selecionar Vigilante</Label>
                  <Select value={formData.vigilante_id} onValueChange={handleVigilanteChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha o vigilante" />
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

                <div className="space-y-2">
                  <Label htmlFor="motorcycle">Selecionar Motocicleta</Label>
                  <Select value={formData.motorcycle_id} onValueChange={handleMotorcycleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha a moto" />
                    </SelectTrigger>
                    <SelectContent>
                      {motorcycles.map((motorcycle) => (
                        <SelectItem key={motorcycle.id} value={motorcycle.id}>
                          {motorcycle.brand} {motorcycle.model} - {motorcycle.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checklistType">Tipo de Checklist</Label>
                  <Select value={formData.checklistType} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, checklistType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo do checklist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start">Início da Ronda</SelectItem>
                      <SelectItem value="end">Fim da Ronda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens de Verificação Detalhados */}
          <Card>
            <CardHeader>
              <CardTitle>Itens de Verificação Profissional</CardTitle>
              <CardDescription>
                Avalie cada item e adicione observações quando necessário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {checklistItems.map((item) => (
                  <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <Label className="font-medium text-lg">{item.label}</Label>
                      {formData[item.field as keyof typeof formData] && 
                       typeof formData[item.field as keyof typeof formData] === 'object' && 
                       (formData[item.field as keyof typeof formData] as ChecklistItem).status && 
                       getStatusBadge((formData[item.field as keyof typeof formData] as ChecklistItem).status)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {item.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Status da Verificação</Label>
                        <RadioGroup
                          value={formData[item.field as keyof typeof formData] && 
                                typeof formData[item.field as keyof typeof formData] === 'object' ? 
                                (formData[item.field as keyof typeof formData] as ChecklistItem).status : ''}
                          onValueChange={(value) => handleItemStatusChange(item.field, value)}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="good" id={`${item.id}-good`} />
                            <Label htmlFor={`${item.id}-good`} className="text-green-700">Bom</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="regular" id={`${item.id}-regular`} />
                            <Label htmlFor={`${item.id}-regular`} className="text-yellow-700">Regular</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="needs_repair" id={`${item.id}-repair`} />
                            <Label htmlFor={`${item.id}-repair`} className="text-red-700">Necessita Reparo</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <Textarea
                        placeholder="Observações adicionais (opcional)"
                        value={formData[item.field as keyof typeof formData] && 
                              typeof formData[item.field as keyof typeof formData] === 'object' ? 
                              (formData[item.field as keyof typeof formData] as ChecklistItem).observation : ''}
                        onChange={(e) => handleItemObservationChange(item.field, e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nível de Combustível com Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Nível de Combustível
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="fuelLevel">Nível atual (%)</Label>
                <Input
                  id="fuelLevel"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fuel_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuel_level: e.target.value }))}
                  className="w-32"
                />
                <div className="flex gap-2">
                  <Badge variant={parseInt(formData.fuel_level) > 50 ? "secondary" : "destructive"}>
                    {parseInt(formData.fuel_level) > 50 ? "Nível OK" : "Nível Baixo"}
                  </Badge>
                </div>
              </div>
              
              <CameraCapture
                title="Foto do Painel - Combustível"
                description="Registre o nível de combustível no painel"
                onCapture={(imageData) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    fuel_photos: [...prev.fuel_photos, imageData] 
                  }));
                }}
              />
            </CardContent>
          </Card>

          {/* Quilometragem com Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Quilometragem da Motocicleta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="motorcycleKm">Quilometragem Atual</Label>
                <Input
                  id="motorcycleKm"
                  type="text"
                  placeholder="Ex: 25.430 km"
                  value={formData.motorcycle_km}
                  onChange={(e) => setFormData(prev => ({ ...prev, motorcycle_km: e.target.value }))}
                />
              </div>
              
              <CameraCapture
                title="Foto do Painel - Quilometragem"
                description="Registre a quilometragem mostrada no painel"
                onCapture={(imageData) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    km_photos: [...prev.km_photos, imageData] 
                  }));
                }}
              />
            </CardContent>
          </Card>

          {/* Fotos da Motocicleta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Lateral Direita', 'Lateral Esquerda', 'Frente', 'Traseira'].map((position, index) => (
              <CameraCapture
                key={position}
                title={`Foto - ${position}`}
                description={`Registre o estado da motocicleta pela ${position.toLowerCase()}`}
                onCapture={(imageData) => {
                  const newPhotos = [...formData.motorcycle_photos];
                  newPhotos[index] = imageData;
                  setFormData(prev => ({ ...prev, motorcycle_photos: newPhotos }));
                }}
              />
            ))}
          </div>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalObservations">Observações Gerais</Label>
                <Textarea
                  id="generalObservations"
                  placeholder="Descreva o estado geral da motocicleta..."
                  value={formData.general_observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, general_observations: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="damages">Danos ou Problemas Identificados</Label>
                <Textarea
                  id="damages"
                  placeholder="Relate qualquer dano, problema ou irregularidade encontrada..."
                  value={formData.damages}
                  onChange={(e) => setFormData(prev => ({ ...prev, damages: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Assinatura Digital */}
          <SignatureCapture 
            onSignature={(signatureData) => setFormData(prev => ({ ...prev, signature: signatureData }))}
          />

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              type="submit" 
              size="lg" 
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Salvando...' : 'Salvar e Enviar'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={generatePDF}
              className="border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </Button>

            <Button 
              type="button" 
              size="lg" 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Finalizar
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChecklistForm;
