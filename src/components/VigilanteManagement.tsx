
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Vigilante, Condominium } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const vigilanteSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  registration: z.string().min(1, 'Registro é obrigatório'),
  status: z.enum(['active', 'inactive'])
});

type VigilanteForm = z.infer<typeof vigilanteSchema>;

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
      const vigilanteData = {
        ...values,
        condominium_id: condominium.id,
      };

      if (editingVigilante) {
        const { error } = await supabase
          .from('vigilantes')
          .update(vigilanteData)
          .eq('id', editingVigilante.id);

        if (error) throw error;
        toast.success('Vigilante atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('vigilantes')
          .insert([vigilanteData]);

        if (error) throw error;
        toast.success('Vigilante criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingVigilante(null);
      form.reset();
      onUpdate();
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
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting vigilante:', error);
      toast.error('Erro ao excluir vigilante: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Vigilantes
            </CardTitle>
            <CardDescription>
              Gerencie os vigilantes do condomínio
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Vigilante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVigilante ? 'Editar Vigilante' : 'Novo Vigilante'}
                </DialogTitle>
                <DialogDescription>
                  {editingVigilante 
                    ? 'Atualize as informações do vigilante' 
                    : 'Preencha as informações do novo vigilante'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="registration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registro *</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de registro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
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
                      {editingVigilante ? 'Atualizar' : 'Criar'}
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
          {vigilantes.map((vigilante) => (
            <div key={vigilante.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{vigilante.name}</p>
                <p className="text-sm text-gray-600">{vigilante.email}</p>
                <p className="text-xs text-gray-500">Registro: {vigilante.registration}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={vigilante.status === 'active' ? 'default' : 'secondary'}>
                  {vigilante.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(vigilante)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(vigilante)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {vigilantes.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhum vigilante encontrado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VigilanteManagement;
