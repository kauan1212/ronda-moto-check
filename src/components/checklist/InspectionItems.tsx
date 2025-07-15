
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InspectionItemsProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}

const InspectionItems = ({ formData, onFormDataChange }: InspectionItemsProps) => {
  const inspectionItems = [
    { key: 'tires', label: 'Pneus' },
    { key: 'brakes', label: 'Freios' },
    { key: 'engine_oil', label: 'Óleo do Motor' },
    { key: 'coolant', label: 'Líquido de Arrefecimento' },
    { key: 'lights', label: 'Sistema de Iluminação' },
    { key: 'electrical', label: 'Sistema Elétrico' },
    { key: 'suspension', label: 'Suspensão' },
    { key: 'cleaning', label: 'Limpeza' },
    { key: 'leaks', label: 'Vazamentos' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens de Verificação do Veículo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {inspectionItems.map((item) => (
          <div key={item.key} className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">{item.label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${item.key}_status`}>Status</Label>
                <RadioGroup 
                  value={formData[`${item.key}_status`]} 
                  onValueChange={(value) => onFormDataChange({[`${item.key}_status`]: value})}
                  className="flex flex-wrap gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id={`${item.key}_good`} />
                    <Label htmlFor={`${item.key}_good`} className="text-green-600 font-medium">Bom</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id={`${item.key}_regular`} />
                    <Label htmlFor={`${item.key}_regular`} className="text-yellow-600 font-medium">Regular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="needs_repair" id={`${item.key}_repair`} />
                    <Label htmlFor={`${item.key}_repair`} className="text-red-600 font-medium">Precisa Reparo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="na" id={`${item.key}_na`} />
                    <Label htmlFor={`${item.key}_na`} className="text-gray-600 font-medium">N/A</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor={`${item.key}_observation`}>Observação</Label>
                <Textarea
                  value={formData[`${item.key}_observation`]}
                  onChange={(e) => onFormDataChange({[`${item.key}_observation`]: e.target.value})}
                  placeholder="Observações sobre este item..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InspectionItems;
