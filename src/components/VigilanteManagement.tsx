
import React, { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Condominium } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vigilanteSchema, VigilanteForm } from './vigilante/vigilanteSchema';
import VigilanteFormComponent from './vigilante/VigilanteForm';
import VigilanteList from './vigilante/VigilanteList';

interface VigilanteManagementProps {
  condominium: Condominium;
  vigilantes: Vigilante[];
  onUpdate: () => void;
}

const VigilanteManagement = ({ condominium, vigilantes, onUpdate }: VigilanteManagementProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVigilante, setEditingVigilante] = useState<Vigilante | null>(null);

  const form = useForm<VigilanteForm>({
    resolver: zodResolver(vigilanteSchema),
    defaultValues: {
      name: '',
      email: '',
      registration: '',
      status: 'active'
    }
  });

  const onSubmit = async (values: VigilanteForm) => {
    try {
      console.log('Submitting vigilante data:', values);
      
      const vigilanteData = {
        name: values.name,
        email: values.email,
        registration: values.registration,
        status: values.status,
        condominium_id: condominium.id,
      };

      console.log('Vigilante data to be saved:', vigilanteData);

      if (editingVigilante) {
        const { error } = await supabase
          .from('vigilantes')
          .update(vigilanteData)
          .eq('id', editingVigilante.id);

        if (error) {
          console.error('Error updating vigilante:', error);
          
          if (error.code === '23505') {
            if (error.message.includes('email')) {
              toast.error('Este email já está sendo usado por outro vigilante');
            } else if (error.message.includes('registration')) {
              toast.error('Este número de registro já está sendo usado por outro vigilante');
            } else {
              toast.error('Dados duplicados - verifique email e registro');
            }
            return;
          }
          
          throw error;
        }
        toast.success('Vigilante atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('vigilantes')
          .insert([vigilanteData]);

        if (error) {
          console.error('Error creating vigilante:', error);
          
          if (error.code === '23505') {
            if (error.message.includes('email')) {
              toast.error('Este email já está sendo usado por outro vigilante');
            } else if (error.message.includes('registration')) {
              toast.error('Este número de registro já está sendo usado por outro vigilante');
            } else {
              toast.error('Dados duplicados - verifique email e registro');
            }
            return;
          }
          
          throw error;
        }
        toast.success('Vigilante criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingVigilante(null);
      form.reset();
      
      // Force update of the parent component
      setTimeout(() => {
        onUpdate();
      }, 100);
      
    } catch (error: any) {
      console.error('Error saving vigilante:', error);
      toast.error('Erro ao salvar vigilante: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = (vigilante: Vigilante) => {
    setEditingVigilante(vigilante);
    form.reset({
      name: vigilante.name,
      email: vigilante.email,
      registration: vigilante.registration,
      status: vigilante.status as 'active' | 'inactive'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (vigilante: Vigilante) => {
    if (!confirm(`Tem certeza que deseja excluir o vigilante "${vigilante.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vigilantes')
        .delete()
        .eq('id', vigilante.id);

      if (error) throw error;
      toast.success('Vigilante excluído com sucesso!');
      
      // Force update of the parent component
      setTimeout(() => {
        onUpdate();
      }, 100);
      
    } catch (error: any) {
      console.error('Error deleting vigilante:', error);
      toast.error('Erro ao excluir vigilante: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleAddVigilante = () => {
    setEditingVigilante(null);
    form.reset({
      name: '',
      email: '',
      registration: '',
      status: 'active'
    });
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Vigilantes ({vigilantes.length})
            </CardTitle>
            <CardDescription>
              Gerencie os vigilantes do condomínio
            </CardDescription>
          </div>
          <Button onClick={handleAddVigilante}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vigilante
          </Button>
        </div>
      </CardHeader>
      
      <VigilanteFormComponent
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onSubmit={onSubmit}
        editingVigilante={editingVigilante}
      />
      
      <VigilanteList
        vigilantes={vigilantes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Card>
  );
};

export default VigilanteManagement;
