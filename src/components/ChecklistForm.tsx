import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Motorcycle } from '@/types';
import CameraCapture from './CameraCapture';
import SignatureCapture from './SignatureCapture';
import { Camera, Download, Save, User, Bike, Calendar, Clock } from 'lucide-react';

interface ChecklistFormData {
  vigilante_id: string;
  motorcycle_id: string;
  type: 'start' | 'end';
  face_photo: string;
  tires_status: string;
  tires_observation: string;
  brakes_status: string;
  brakes_observation: string;
  engine_oil_status: string;
  engine_oil_observation: string;
  coolant_status: string;
  coolant_observation: string;
  lights_status: string;
  lights_observation: string;
  electrical_status: string;
  electrical_observation: string;
  suspension_status: string;
  suspension_observation: string;
  cleaning_status: string;
  cleaning_observation: string;
  leaks_status: string;
  leaks_observation: string;
  motorcycle_photos: string[];
  fuel_photos: string[];
  motorcycle_km: string;
  km_photos: string[];
  general_observations: string;
  damages: string;
  signature: string;
  fuel_level: number;
}

interface ChecklistFormProps {
  onComplete: () => void;
}

const ChecklistForm = ({ onComplete }: ChecklistFormProps) => {
  const [formData, setFormData] = useState<ChecklistFormData>({
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
    fuel_photos: [],
    motorcycle_km: '',
    km_photos: [],
    general_observations: '',
    damages: '',
    signature: '',
    fuel_level: 0
  });

  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [vigilantesResult, motorcyclesResult] = await Promise.all([
        supabase.from('vigilantes').select('*'),
        supabase.from('motorcycles').select('*')
      ]);

      if (vigilantesResult.data) setVigilantes(vigilantesResult.data);
      if (motorcyclesResult.data) setMotorcycles(motorcyclesResult.data);
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.vigilante_id || !formData.motorcycle_id) {
      toast.error('Por favor, selecione um vigilante e uma motocicleta');
      return;
    }

    if (!formData.signature) {
      toast.error('Por favor, adicione sua assinatura');
      return;
    }

    try {
      const selectedVigilante = vigilantes.find(v => v.id === formData.vigilante_id);
      const selectedMotorcycle = motorcycles.find(m => m.id === formData.motorcycle_id);

      if (!selectedVigilante || !selectedMotorcycle) {
        toast.error('Vigilante ou motocicleta não encontrados');
        return;
      }

      const checklistData = {
        vigilante_id: formData.vigilante_id,
        motorcycle_id: formData.motorcycle_id,
        vigilante_name: selectedVigilante.name,
        motorcycle_plate: selectedMotorcycle.plate,
        type: formData.type,
        face_photo: formData.face_photo || null,
        tires_status: formData.tires_status || null,
        tires_observation: formData.tires_observation || null,
        brakes_status: formData.brakes_status || null,
        brakes_observation: formData.brakes_observation || null,
        engine_oil_status: formData.engine_oil_status || null,
        engine_oil_observation: formData.engine_oil_observation || null,
        coolant_status: formData.coolant_status || null,
        coolant_observation: formData.coolant_observation || null,
        lights_status: formData.lights_status || null,
        lights_observation: formData.lights_observation || null,
        electrical_status: formData.electrical_status || null,
        electrical_observation: formData.electrical_observation || null,
        suspension_status: formData.suspension_status || null,
        suspension_observation: formData.suspension_observation || null,
        cleaning_status: formData.cleaning_status || null,
        cleaning_observation: formData.cleaning_observation || null,
        leaks_status: formData.leaks_status || null,
        leaks_observation: formData.leaks_observation || null,
        motorcycle_photos: formData.motorcycle_photos,
        fuel_photos: formData.fuel_photos,
        motorcycle_km: formData.motorcycle_km || null,
        km_photos: formData.km_photos,
        general_observations: formData.general_observations || null,
        damages: formData.damages || null,
        signature: formData.signature,
        status: 'completed',
        condominium_id: selectedVigilante.condominium_id || selectedMotorcycle.condominium_id
      };

      console.log('Salvando checklist com dados:', checklistData);

      const { data, error } = await supabase
        .from('checklists')
        .insert([checklistData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar checklist:', error);
        toast.error(`Erro ao salvar checklist: ${error.message}`);
        return;
      }

      console.log('Checklist salvo com sucesso:', data);
      toast.success('Checklist salvo com sucesso!');
      
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
        fuel_photos: [],
        motorcycle_km: '',
        km_photos: [],
        general_observations: '',
        damages: '',
        signature: '',
        fuel_level: 0
      });
      
      onComplete();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao salvar checklist');
    }
  };

  const generatePDF = () => {
    const selectedVigilante = vigilantes.find(v => v.id === formData.vigilante_id);
    const selectedMotorcycle = motorcycles.find(m => m.id === formData.motorcycle_id);
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('pt-BR');
    const timeStr = currentDate.toLocaleTimeString('pt-BR');

    if (!selectedVigilante || !selectedMotorcycle) {
      toast.error('Selecione um vigilante e uma motocicleta primeiro');
      return;
    }

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'good': return 'Bom';
        case 'regular': return 'Regular';
        case 'needs_repair': return 'Precisa Reparo';
        case 'na': return 'N/A';
        default: return 'Não verificado';
      }
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Checklist de Vistoria - ${selectedMotorcycle.plate}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-card {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .info-card h3 {
            color: #1e40af;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
          }
          .inspection-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .inspection-item {
            background-color: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 20px;
          }
          .inspection-item h4 {
            color: #374151;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: bold;
          }
          .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .status.good { background-color: #dcfce7; color: #166534; }
          .status.regular { background-color: #fef3c7; color: #92400e; }
          .status.needs_repair { background-color: #fee2e2; color: #991b1b; }
          .status.na { background-color: #f3f4f6; color: #6b7280; }
          .observation {
            background-color: #f9fafb;
            padding: 10px;
            border-radius: 4px;
            font-style: italic;
            color: #6b7280;
          }
          .photos-section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
          }
          .signature-section {
            margin-top: 40px;
            padding: 20px;
            background-color: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
          }
          .signature-img {
            max-width: 300px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .datetime-info {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #2563eb;
          }
          .datetime-info strong {
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RELATÓRIO DE VISTORIA DE MOTOCICLETA</h1>
          <div class="datetime-info">
            <strong>Data:</strong> ${dateStr} | <strong>Horário:</strong> ${timeStr}
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h3>📋 Informações da Vistoria</h3>
            <p><strong>Tipo:</strong> ${formData.type === 'start' ? 'Início de Turno' : 'Fim de Turno'}</p>
            <p><strong>Status:</strong> Concluída</p>
            <p><strong>Quilometragem:</strong> ${formData.motorcycle_km || 'Não informado'}</p>
          </div>
          
          <div class="info-card">
            <h3>👮 Vigilante Responsável</h3>
            <p><strong>Nome:</strong> ${selectedVigilante.name}</p>
            <p><strong>Email:</strong> ${selectedVigilante.email}</p>
            <p><strong>Matrícula:</strong> ${selectedVigilante.registration}</p>
          </div>
          
          <div class="info-card">
            <h3>🏍️ Dados da Motocicleta</h3>
            <p><strong>Placa:</strong> ${selectedMotorcycle.plate}</p>
            <p><strong>Marca/Modelo:</strong> ${selectedMotorcycle.brand} ${selectedMotorcycle.model}</p>
            <p><strong>Ano:</strong> ${selectedMotorcycle.year}</p>
            <p><strong>Cor:</strong> ${selectedMotorcycle.color}</p>
          </div>
        </div>

        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">🔍 ITENS VERIFICADOS</h2>
        
        <div class="inspection-grid">
          <div class="inspection-item">
            <h4>🛞 Pneus</h4>
            <div class="status ${formData.tires_status}">${getStatusLabel(formData.tires_status)}</div>
            ${formData.tires_observation ? `<div class="observation">${formData.tires_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🛑 Freios</h4>
            <div class="status ${formData.brakes_status}">${getStatusLabel(formData.brakes_status)}</div>
            ${formData.brakes_observation ? `<div class="observation">${formData.brakes_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🛢️ Óleo do Motor</h4>
            <div class="status ${formData.engine_oil_status}">${getStatusLabel(formData.engine_oil_status)}</div>
            ${formData.engine_oil_observation ? `<div class="observation">${formData.engine_oil_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🌡️ Arrefecimento</h4>
            <div class="status ${formData.coolant_status}">${getStatusLabel(formData.coolant_status)}</div>
            ${formData.coolant_observation ? `<div class="observation">${formData.coolant_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>💡 Sistema de Iluminação</h4>
            <div class="status ${formData.lights_status}">${getStatusLabel(formData.lights_status)}</div>
            ${formData.lights_observation ? `<div class="observation">${formData.lights_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>⚡ Sistema Elétrico</h4>
            <div class="status ${formData.electrical_status}">${getStatusLabel(formData.electrical_status)}</div>
            ${formData.electrical_observation ? `<div class="observation">${formData.electrical_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🔧 Suspensão</h4>
            <div class="status ${formData.suspension_status}">${getStatusLabel(formData.suspension_status)}</div>
            ${formData.suspension_observation ? `<div class="observation">${formData.suspension_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>🧽 Limpeza</h4>
            <div class="status ${formData.cleaning_status}">${getStatusLabel(formData.cleaning_status)}</div>
            ${formData.cleaning_observation ? `<div class="observation">${formData.cleaning_observation}</div>` : ''}
          </div>
          
          <div class="inspection-item">
            <h4>💧 Vazamentos</h4>
            <div class="status ${formData.leaks_status}">${getStatusLabel(formData.leaks_status)}</div>
            ${formData.leaks_observation ? `<div class="observation">${formData.leaks_observation}</div>` : ''}
          </div>
        </div>

        ${formData.general_observations ? `
        <div class="info-card">
          <h3>📝 Observações Gerais</h3>
          <p>${formData.general_observations}</p>
        </div>
        ` : ''}

        ${formData.damages ? `
        <div class="info-card">
          <h3>⚠️ Danos Identificados</h3>
          <p>${formData.damages}</p>
        </div>
        ` : ''}

        <div class="photos-section">
          <h3>📸 Registros Fotográficos</h3>
          <p><strong>Fotos da Motocicleta:</strong> ${formData.motorcycle_photos.length} foto(s) registrada(s)</p>
          <p><strong>Fotos do Combustível:</strong> ${formData.fuel_photos.length} foto(s) registrada(s)</p>
          <p><strong>Fotos do Odômetro:</strong> ${formData.km_photos.length} foto(s) registrada(s)</p>
          ${formData.face_photo ? '<p><strong>Foto Facial:</strong> 1 foto registrada</p>' : ''}
        </div>

        <div class="signature-section">
          <h3>✍️ Assinatura do Vigilante</h3>
          ${formData.signature ? `<img src="${formData.signature}" alt="Assinatura" class="signature-img">` : '<p>Assinatura não disponível</p>'}
          <p style="margin-top: 15px;"><strong>Vigilante:</strong> ${selectedVigilante.name}</p>
          <p><strong>Data e Hora:</strong> ${dateStr} às ${timeStr}</p>
        </div>

        <div class="footer">
          <p>Relatório gerado automaticamente pelo Sistema de Gestão de Vigilância</p>
          <p>Data de geração: ${dateStr} às ${timeStr}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checklist-${selectedMotorcycle.plate}-${dateStr.replace(/\//g, '-')}-${timeStr.replace(/:/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Relatório PDF gerado com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
          <Clock className="h-5 w-5 text-blue-600 ml-4" />
          <span className="text-sm text-gray-600">
            {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seleção do Vigilante e Motocicleta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vigilante">Vigilante</Label>
              <Select value={formData.vigilante_id} onValueChange={(value) => setFormData({...formData, vigilante_id: value})}>
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
              <Label htmlFor="motorcycle">Motocicleta</Label>
              <Select value={formData.motorcycle_id} onValueChange={(value) => setFormData({...formData, motorcycle_id: value})}>
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
          </div>

          <div>
            <Label htmlFor="type">Tipo de Checklist</Label>
            <Select value={formData.type} onValueChange={(value: 'start' | 'end') => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Início de Turno</SelectItem>
                <SelectItem value="end">Fim de Turno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 pt-6">
        <Button 
          onClick={handleSave} 
          className="flex-1 flex items-center gap-2"
          disabled={!formData.vigilante_id || !formData.motorcycle_id || !formData.signature}
        >
          <Save className="h-4 w-4" />
          Salvar Checklist
        </Button>
        
        <Button 
          onClick={generatePDF} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={!formData.vigilante_id || !formData.motorcycle_id}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default ChecklistForm;
