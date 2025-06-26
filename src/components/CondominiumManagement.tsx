import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Condominium } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';

const condominiumSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  address: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional(),
  phone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  email: z.string().email('Email inválido').max(100, 'Email deve ter no máximo 100 caracteres').optional().or(z.literal(''))
});

type CondominiumForm = z.infer<typeof condominiumSchema>;

interface CondominiumManagementProps {
  onSelect: (condominium: Condominium) => void;
}

const CondominiumManagement = ({ onSelect }: CondominiumManagementProps) => {
  const { signOut, user } = useAuth();
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
      console.log('Fetching condominiums for current user...');
      
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching condominiums:', error);
        toast.error('Erro ao carregar condomínios: ' + error.message);
        return;
      }

      console.log('Fetched condominiums:', data?.length || 0);
      setCondominiums(data || []);
    } catch (error) {
      console.error('Unexpected error fetching condominiums:', error);
      toast.error('Erro inesperado ao carregar condomínios');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: CondominiumForm) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      console.log('Saving condominium with user_id:', user.id);

      // Sanitize input data and ensure user_id is set
      const condominiumData = {
        name: values.name.trim(),
        address: values.address?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
        user_id: user.id, // Sempre definir o user_id como o usuário atual
      };

      if (editingCondominium) {
        console.log('Updating condominium:', editingCondominium.id);
        const { error } = await supabase
          .from('condominiums')
          .update(condominiumData)
          .eq('id', editingCondominium.id);

        if (error) {
          console.error('Error updating condominium:', error);
          throw error;
        }
        toast.success('Condomínio atualizado com sucesso!');
      } else {
        console.log('Creating new condominium');
        const { error } = await supabase
          .from('condominiums')
          .insert([condominiumData]);

        if (error) {
          console.error('Error creating condominium:', error);
          throw error;
        }
        toast.success('Condomínio criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingCondominium(null);
      form.reset();
      fetchCondominiums();
    } catch (error: any) {
      console.error('Error saving condominium:', error);
      toast.error('Erro ao salvar condomínio: ' + (error.message || 'Erro desconhecido'));
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
    if (!confirm(`Tem certeza que deseja excluir o condomínio "${condominium.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      console.log('Deleting condominium:', condominium.id);
      const { error } = await supabase
        .from('condominiums')
        .delete()
        .eq('id', condominium.id);

      if (error) {
        console.error('Error deleting condominium:', error);
        throw error;
      }
      toast.success('Condomínio excluído com sucesso!');
      fetchCondominiums();
    } catch (error: any) {
      console.error('Error deleting condominium:', error);
      toast.error('Erro ao excluir condomínio: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCondominium(null);
    form.reset();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base">Carregando condomínios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex items-center justify-center flex-1">
              <img 
                src="/lovable-uploads/2c80dbd7-a4ae-44cb-ad84-3b14b0d68244.png" 
                alt="Grupo Celdan Facilities" 
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg shadow-lg"
              />
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 ml-2 sm:ml-4">
                Sistema de Vigilância
              </h1>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
          <p className="text-lg sm:text-xl text-slate-600 mb-4 px-2">
            Gerencie e selecione o condomínio para acessar o painel administrativo
          </p>
          
          <div className="flex justify-center mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Condomínio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] mx-4 max-w-[calc(100vw-2rem)]">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    {editingCondominium ? 'Editar Condomínio' : 'Novo Condomínio'}
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
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
                          <FormLabel className="text-sm sm:text-base">Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do condomínio" {...field} className="text-sm sm:text-base" />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Endereço completo" {...field} className="text-sm sm:text-base" />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} className="text-sm sm:text-base" />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="contato@condominio.com" {...field} className="text-sm sm:text-base" />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={handleDialogClose} className="w-full sm:w-auto">
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        {editingCondominium ? 'Atualizar' : 'Criar'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {condominiums.map((condominium) => (
            <Card 
              key={condominium.id} 
              className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <div className="flex items-center min-w-0 flex-1">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{condominium.name}</span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(condominium)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(condominium)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {condominium.address && (
                  <div className="flex items-start text-xs sm:text-sm text-slate-600">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span className="break-words">{condominium.address}</span>
                  </div>
                )}
                {condominium.phone && (
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-slate-400 flex-shrink-0" />
                    <span className="break-words">{condominium.phone}</span>
                  </div>
                )}
                {condominium.email && (
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-slate-400 flex-shrink-0" />
                    <span className="break-words">{condominium.email}</span>
                  </div>
                )}
                <Button 
                  onClick={() => onSelect(condominium)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                >
                  Acessar Painel
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {condominiums.length === 0 && (
            <div className="col-span-full text-center py-8 sm:py-12">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">
                Nenhum condomínio cadastrado
              </h3>
              <p className="text-sm sm:text-base text-slate-500 mb-4 px-4">
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
