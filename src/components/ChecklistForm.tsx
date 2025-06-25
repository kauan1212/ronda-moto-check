
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChecklistFormProps {
  onBack: () => void;
}

const ChecklistForm = ({ onBack }: ChecklistFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    motorcycleId: '',
    checklistType: '',
    // Fotos
    facePhoto: '',
    motorcyclePhotos: [] as string[],
    // Itens de verificação detalhados
    tires: { checked: false, observation: '' },
    brakes: { checked: false, observation: '' },
    engineOil: { checked: false, observation: '' },
    coolant: { checked: false, observation: '' },
    lights: { checked: false, observation: '' },
    electrical: { checked: false, observation: '' },
    suspension: { checked: false, observation: '' },
    cleaning: { checked: false, observation: '' },
    leaks: { checked: false, observation: '' },
    // Observações
    generalObservations: '',
    damages: '',
    fuelLevel: '50',
    // Assinatura
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.facePhoto) {
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

    console.log('Checklist completo:', formData);
    
    toast({
      title: "Checklist salvo com sucesso!",
      description: "Checklist foi processado e está pronto para envio.",
    });
  };

  const generatePDF = () => {
    toast({
      title: "PDF Gerado",
      description: "Download do PDF iniciado.",
    });
  };

  const sendToAdmin = () => {
    toast({
      title: "Enviado para administração",
      description: "Checklist enviado com sucesso para o painel administrativo.",
    });
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
            onCapture={(imageData) => setFormData(prev => ({ ...prev, facePhoto: imageData }))}
          />

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="h-5 w-5" />
                Informações da Motocicleta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motorcycle">Selecionar Motocicleta</Label>
                  <Select value={formData.motorcycleId} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, motorcycleId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha a moto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="honda-150">Honda CG 150 - ABC-1234</SelectItem>
                      <SelectItem value="yamaha-125">Yamaha Factor 125 - DEF-5678</SelectItem>
                      <SelectItem value="honda-160">Honda Bros 160 - GHI-9012</SelectItem>
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
                Marque os itens que estão em bom estado e adicione observações quando necessário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {checklistItems.map((item) => (
                  <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={item.id}
                        checked={formData[item.field as keyof typeof formData]?.checked as boolean}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ 
                            ...prev, 
                            [item.field]: { 
                              ...prev[item.field as keyof typeof formData], 
                              checked 
                            } 
                          }))
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <Label htmlFor={item.id} className="font-medium cursor-pointer">
                            {item.label}
                          </Label>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {item.description}
                        </p>
                        <Textarea
                          placeholder="Observações adicionais (opcional)"
                          value={formData[item.field as keyof typeof formData]?.observation as string || ''}
                          onChange={(e) =>
                            setFormData(prev => ({ 
                              ...prev, 
                              [item.field]: { 
                                ...prev[item.field as keyof typeof formData], 
                                observation: e.target.value 
                              } 
                            }))
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nível de Combustível */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Nível de Combustível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="fuelLevel">Nível atual (%)</Label>
                <Input
                  id="fuelLevel"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fuelLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuelLevel: e.target.value }))}
                  className="w-32"
                />
                <div className="flex gap-2">
                  <Badge variant={parseInt(formData.fuelLevel) > 50 ? "secondary" : "destructive"}>
                    {parseInt(formData.fuelLevel) > 50 ? "Nível OK" : "Nível Baixo"}
                  </Badge>
                </div>
              </div>
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
                  const newPhotos = [...formData.motorcyclePhotos];
                  newPhotos[index] = imageData;
                  setFormData(prev => ({ ...prev, motorcyclePhotos: newPhotos }));
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
                  value={formData.generalObservations}
                  onChange={(e) => setFormData(prev => ({ ...prev, generalObservations: e.target.value }))}
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
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Save className="h-5 w-5 mr-2" />
              Salvar Checklist
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
              onClick={sendToAdmin}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Send className="h-5 w-5 mr-2" />
              Enviar para Admin
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChecklistForm;
