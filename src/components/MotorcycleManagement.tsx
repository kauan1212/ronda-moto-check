
import React, { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bike } from 'lucide-react';
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
              toast.error('Esta placa já está sendo usada por outra motocicleta');
            } else {
              toast.error('Dados duplicados - verifique a placa');
            }
            return;
          }
          
          throw error;
        }
        toast.success('Motocicleta atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('motorcycles')
          .insert([motorcycleData]);

        if (error) {
          if (error.code === '23505') {
            if (error.message.includes('plate')) {
              toast.error('Esta placa já está sendo usada por outra motocicleta');
            } else {
              toast.error('Dados duplicados - verifique a placa');
            }
            return;
          }
          
          throw error;
        }
        toast.success('Motocicleta criada com sucesso!');
      }

      setDialogOpen(false);
      setEditingMotorcycle(null);
      form.reset();
      
      // Force update of the parent component
      setTimeout(() => {
        onUpdate();
      }, 100);
      
    } catch (error: any) {
      toast.error('Erro ao salvar motocicleta');
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
    if (!confirm(`Tem certeza que deseja excluir a motocicleta "${motorcycle.plate}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('motorcycles')
        .delete()
        .eq('id', motorcycle.id);

      if (error) throw error;
      toast.success('Motocicleta excluída com sucesso!');
      
      // Force update of the parent component
      setTimeout(() => {
        onUpdate();
      }, 100);
      
    } catch (error: any) {
      toast.error('Erro ao excluir motocicleta');
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5" />
              Motocicletas ({motorcycles.length})
            </CardTitle>
            <CardDescription>
              Gerencie a frota de motocicletas do condomínio
            </CardDescription>
          </div>
          <Button onClick={handleAddMotorcycle}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Motocicleta
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
