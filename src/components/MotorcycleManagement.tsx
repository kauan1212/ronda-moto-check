
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Bike } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Motorcycle, Condominium } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const motorcycleSchema = z.object({
  plate: z.string().min(1, 'Placa é obrigatória'),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Cor é obrigatória'),
  status: z.enum(['available', 'in_use', 'maintenance'])
});

type MotorcycleForm = z.infer<typeof motorcycleSchema>;

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
        ...values,
        condominium_id: condominium.id,
      };

      if (editingMotorcycle) {
        const { error } = await supabase
          .from('motorcycles')
          .update(motorcycleData)
          .eq('id', editingMotorcycle.id);

        if (error) throw error;
        toast.success('Motocicleta atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('motorcycles')
          .insert([motorcycleData]);

        if (error) throw error;
        toast.success('Motocicleta criada com sucesso!');
      }

      setDialogOpen(false);
      setEditingMotorcycle(null);
      form.reset();
      onUpdate();
    } catch (error: any) {
      console.error('Error saving motorcycle:', error);
      toast.error('Erro ao salvar motocicleta: ' + (error.message || 'Erro desconhecido'));
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
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting motorcycle:', error);
      toast.error('Erro ao excluir motocicleta: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5" />
              Motocicletas
            </CardTitle>
            <CardDescription>
              Gerencie a frota de motocicletas do condomínio
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Motocicleta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMotorcycle ? 'Editar Motocicleta' : 'Nova Motocicleta'}
                </DialogTitle>
                <DialogDescription>
                  {editingMotorcycle 
                    ? 'Atualize as informações da motocicleta' 
                    : 'Preencha as informações da nova motocicleta'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca *</FormLabel>
                          <FormControl>
                            <Input placeholder="Honda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo *</FormLabel>
                          <FormControl>
                            <Input placeholder="CG 160" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2023" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor *</FormLabel>
                          <FormControl>
                            <Input placeholder="Vermelha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">Disponível</SelectItem>
                            <SelectItem value="in_use">Em Uso</SelectItem>
                            <SelectItem value="maintenance">Manutenção</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingMotorcycle ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {motorcycles.map((motorcycle) => (
            <div key={motorcycle.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{motorcycle.plate}</p>
                <p className="text-sm text-gray-600">
                  {motorcycle.brand} {motorcycle.model} {motorcycle.year}
                </p>
                <p className="text-xs text-gray-500">Cor: {motorcycle.color}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    motorcycle.status === 'available' ? 'default' : 
                    motorcycle.status === 'in_use' ? 'secondary' : 'destructive'
                  }
                >
                  {motorcycle.status === 'available' ? 'Disponível' : 
                   motorcycle.status === 'in_use' ? 'Em Uso' : 'Manutenção'}
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(motorcycle)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(motorcycle)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {motorcycles.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhuma motocicleta encontrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MotorcycleManagement;
