
import React, { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Motorcycle, Condominium } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motorcycleSchema, MotorcycleForm } from './motorcycle/motorcycleSchema';
import MotorcycleFormComponent from './motorcycle/MotorcycleForm';
import MotorcycleList from './motorcycle/MotorcycleList';

interface MotorcycleManagementProps {
  condominium: Condominium;
  motorcycles: Motorcycle[];
  onUpdate: () => void;
}

const MotorcycleManagement = ({ condominium, motorcycles, onUpdate }: MotorcycleManagementProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMotorcycle, setEditingMotorcycle] = useState<Motorcycle | null>(null);

  const form = useForm<MotorcycleForm>({
    resolver: zodResolver(motorcycleSchema),
    defaultValues: {
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      status: 'available'
    }
  });

  const onSubmit = async (values: MotorcycleForm) => {
    try {
      const motorcycleData = {
        plate: values.plate.toUpperCase(),
        brand: values.brand,
        model: values.model,
        year: values.year,
        color: values.color,
        status: values.status,
        condominium_id: condominium.id,
      };

      if (editingMotorcycle) {
        const { error } = await supabase
          .from('motorcycles')
          .update(motorcycleData)
          .eq('id', editingMotorcycle.id);

        if (error) {
          if (error.code === '23505') {
            if (error.message.includes('plate')) {
              toast.error('Esta placa já está sendo usada por outro veículo');
            } else {
              toast.error('Dados duplicados - verifique a placa');
            }
            return;
          }
          
          throw error;
        }
        toast.success('Veículo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('motorcycles')
          .insert([motorcycleData]);

        if (error) {
          if (error.code === '23505') {
            if (error.message.includes('plate')) {
              toast.error('Esta placa já está sendo usada por outro veículo');
            } else {
              toast.error('Dados duplicados - verifique a placa');
            }
            return;
          }
          
          throw error;
        }
        toast.success('Veículo criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingMotorcycle(null);
      form.reset();
      
      // Force update of the parent component
      setTimeout(() => {
        onUpdate();
      }, 100);
      
    } catch (error: any) {
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleEdit = (motorcycle: Motorcycle) => {
    setEditingMotorcycle(motorcycle);
    form.reset({
      plate: motorcycle.plate,
      brand: motorcycle.brand,
      model: motorcycle.model,
      year: motorcycle.year,
      color: motorcycle.color,
      status: motorcycle.status as 'available' | 'in_use' | 'maintenance'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (motorcycle: Motorcycle) => {
    if (!confirm(`Tem certeza que deseja excluir o veículo "${motorcycle.plate}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('motorcycles')
        .delete()
        .eq('id', motorcycle.id);

      if (error) throw error;
      toast.success('Veículo excluído com sucesso!');
      
      // Force update of the parent component
      setTimeout(() => {
        onUpdate();
      }, 100);
      
    } catch (error: any) {
      toast.error('Erro ao excluir veículo');
    }
  };

  const handleAddMotorcycle = () => {
    setEditingMotorcycle(null);
    form.reset({
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      status: 'available'
    });
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Car className="h-5 w-5" />
              Veículos ({motorcycles.length})
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Gerencie a frota de veículos do condomínio
            </CardDescription>
          </div>
          <Button onClick={handleAddMotorcycle} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Veículo
          </Button>
        </div>
      </CardHeader>
      
      <MotorcycleFormComponent
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onSubmit={onSubmit}
        editingMotorcycle={editingMotorcycle}
      />
      
      <MotorcycleList
        motorcycles={motorcycles}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Card>
  );
};

export default MotorcycleManagement;
