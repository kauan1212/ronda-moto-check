
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Condominium } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const condominiumSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal(''))
});

type CondominiumForm = z.infer<typeof condominiumSchema>;

interface CondominiumManagementProps {
  onSelect: (condominium: Condominium) => void;
}

const CondominiumManagement = ({ onSelect }: CondominiumManagementProps) => {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondominium, setEditingCondominium] = useState<Condominium | null>(null);

  const form = useForm<CondominiumForm>({
    resolver: zodResolver(condominiumSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: ''
    }
  });

  useEffect(() => {
    fetchCondominiums();
  }, []);

  const fetchCondominiums = async () => {
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .order('name');

      if (error) throw error;
      setCondominiums(data || []);
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error);
      toast.error('Erro ao carregar condomínios');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: CondominiumForm) => {
    try {
      if (editingCondominium) {
        const { error } = await supabase
          .from('condominiums')
          .update(values)
          .eq('id', editingCondominium.id);

        if (error) throw error;
        toast.success('Condomínio atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('condominiums')
          .insert([values]);

        if (error) throw error;
        toast.success('Condomínio criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingCondominium(null);
      form.reset();
      fetchCondominiums();
    } catch (error) {
      console.error('Erro ao salvar condomínio:', error);
      toast.error('Erro ao salvar condomínio');
    }
  };

  const handleEdit = (condominium: Condominium) => {
    setEditingCondominium(condominium);
    form.reset({
      name: condominium.name,
      address: condominium.address || '',
      phone: condominium.phone || '',
      email: condominium.email || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (condominium: Condominium) => {
    if (!confirm(`Tem certeza que deseja excluir o condomínio "${condominium.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('condominiums')
        .delete()
        .eq('id', condominium.id);

      if (error) throw error;
      toast.success('Condomínio excluído com sucesso!');
      fetchCondominiums();
    } catch (error) {
      console.error('Erro ao excluir condomínio:', error);
      toast.error('Erro ao excluir condomínio');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCondominium(null);
    form.reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando condomínios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/placeholder.svg" 
              alt="Logo" 
              className="h-16 w-16 rounded-lg shadow-lg"
            />
            <h1 className="text-4xl font-bold text-slate-800 ml-4">
              Sistema de Vigilância
            </h1>
          </div>
          <p className="text-xl text-slate-600 mb-8">
            Gerencie e selecione o condomínio para acessar o painel administrativo
          </p>
          
          <div className="flex justify-center mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Condomínio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCondominium ? 'Editar Condomínio' : 'Novo Condomínio'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCondominium 
                      ? 'Atualize as informações do condomínio' 
                      : 'Preencha as informações do novo condomínio'
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
                            <Input placeholder="Nome do condomínio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Endereço completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="contato@condominio.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {editingCondominium ? 'Atualizar' : 'Criar'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {condominiums.map((condominium) => (
            <Card 
              key={condominium.id} 
              className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    {condominium.name}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(condominium)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(condominium)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {condominium.address && (
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-slate-400" />
                    <span>{condominium.address}</span>
                  </div>
                )}
                {condominium.phone && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{condominium.phone}</span>
                  </div>
                )}
                {condominium.email && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{condominium.email}</span>
                  </div>
                )}
                <Button 
                  onClick={() => onSelect(condominium)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Acessar Painel
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {condominiums.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                Nenhum condomínio cadastrado
              </h3>
              <p className="text-slate-500 mb-4">
                Comece criando seu primeiro condomínio
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CondominiumManagement;
