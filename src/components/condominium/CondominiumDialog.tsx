
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Condominium } from '@/types';

const condominiumSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  address: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional(),
  phone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  email: z.string().email('Email inválido').max(100, 'Email deve ter no máximo 100 caracteres').optional().or(z.literal(''))
});

type CondominiumForm = z.infer<typeof condominiumSchema>;

interface CondominiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCondominium: Condominium | null;
  onSubmit: (values: CondominiumForm) => Promise<boolean>;
}

const CondominiumDialog = ({ open, onOpenChange, editingCondominium, onSubmit }: CondominiumDialogProps) => {
  const form = useForm<CondominiumForm>({
    resolver: zodResolver(condominiumSchema),
    defaultValues: {
      name: editingCondominium?.name || '',
      address: editingCondominium?.address || '',
      phone: editingCondominium?.phone || '',
      email: editingCondominium?.email || ''
    }
  });

  // Reset form when editingCondominium changes
  React.useEffect(() => {
    form.reset({
      name: editingCondominium?.name || '',
      address: editingCondominium?.address || '',
      phone: editingCondominium?.phone || '',
      email: editingCondominium?.email || ''
    });
  }, [editingCondominium, form]);

  const handleSubmit = async (values: CondominiumForm) => {
    const success = await onSubmit(values);
    if (success) {
      onOpenChange(false);
      form.reset();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
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
  );
};

export default CondominiumDialog;
