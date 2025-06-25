
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Camera, 
  Bike, 
  Fuel, 
  Shield, 
  Lightbulb, 
  Eye, 
  Settings,
  PenTool,
  Save,
  FileText
} from 'lucide-react';

interface ChecklistFormProps {
  onBack: () => void;
}

const ChecklistForm = ({ onBack }: ChecklistFormProps) => {
  const [formData, setFormData] = useState({
    motorcycleId: '',
    checklistType: '',
    // Itens de verificação
    engineOil: false,
    brakes: false,
    tires: false,
    lights: false,
    mirrors: false,
    horn: false,
    // Observações
    generalObservations: '',
    damages: '',
    fuelLevel: '50'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Checklist submetido:', formData);
    // Aqui seria implementada a lógica de envio
  };

  const checklistItems = [
    { id: 'engineOil', label: 'Nível do óleo do motor', icon: Fuel, field: 'engineOil' },
    { id: 'brakes', label: 'Sistema de freios', icon: Shield, field: 'brakes' },
    { id: 'tires', label: 'Estado dos pneus', icon: Settings, field: 'tires' },
    { id: 'lights', label: 'Faróis e lanternas', icon: Lightbulb, field: 'lights' },
    { id: 'mirrors', label: 'Retrovisores', icon: Eye, field: 'mirrors' },
    { id: 'horn', label: 'Buzina', icon: Settings, field: 'horn' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="hover:scale-105 transition-transform">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Checklist da Motocicleta
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Inspecione todos os itens antes de iniciar a ronda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Itens de Verificação */}
        <Card>
          <CardHeader>
            <CardTitle>Itens de Verificação</CardTitle>
            <CardDescription>
              Marque todos os itens que estão em bom estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Checkbox
                    id={item.id}
                    checked={formData[item.field as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, [item.field]: checked }))
                    }
                  />
                  <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                    {item.label}
                  </Label>
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

        {/* Fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Fotos da Motocicleta
            </CardTitle>
            <CardDescription>
              Tire fotos do estado geral da moto e de eventuais danos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Lateral Direita', 'Lateral Esquerda', 'Frente', 'Traseira'].map((position) => (
                <div key={position} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">{position}</p>
                  <p className="text-xs text-slate-500 mt-1">Clique para adicionar</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
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

        {/* Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Assinatura Digital
            </CardTitle>
            <CardDescription>
              Assine digitalmente para confirmar a inspeção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
              <PenTool className="h-12 w-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">Clique aqui para assinar</p>
              <p className="text-xs text-slate-500 mt-1">Desenhe sua assinatura nesta área</p>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            type="submit" 
            size="lg" 
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Save className="h-5 w-5 mr-2" />
            Salvar Checklist
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            className="flex-1 border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <FileText className="h-5 w-5 mr-2" />
            Gerar PDF
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChecklistForm;
