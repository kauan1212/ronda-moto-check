
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile, CreateUserData, UpdateUserData } from './types';

export const useUserOperations = () => {
  const queryClient = useQueryClient();

  // Buscar todos os usuários
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching all users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Fetched users:', data?.length);
      return data as UserProfile[];
    }
  });

  // Criar novo usuário
  const createUserMutation = useMutation({
    mutationFn: async ({ email, password, fullName, isAdmin }: CreateUserData) => {
      console.log('Creating user:', { email, fullName, isAdmin });
      
      // Criar usuário via Auth Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: fullName
        },
        email_confirm: true
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('User created in auth:', authData.user?.id);

      if (authData.user) {
        // Atualizar perfil com informações adicionais
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_admin: isAdmin,
            // Novos usuários ficam pendentes até aprovação do admin
            account_status: 'pending'
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }

        // Se for admin, adicionar role de admin
        if (isAdmin) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'admin'
            });

          if (roleError) {
            console.error('Role assignment error:', roleError);
            throw roleError;
          }
        }
      }

      return authData;
    },
    onSuccess: () => {
      toast.success('Usuário criado com sucesso! Conta pendente de aprovação.');
      refetch();
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast.error(`Erro ao criar usuário: ${error.message}`);
    }
  });

  // Atualizar usuário existente
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, fullName, isAdmin }: UpdateUserData) => {
      console.log('Updating user:', { userId, fullName, isAdmin });
      
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          is_admin: isAdmin 
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Gerenciar roles
      if (isAdmin) {
        // Inserir role admin se não existir
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'admin'
          });

        if (roleError) {
          console.error('Role upsert error:', roleError);
          throw roleError;
        }
      } else {
        // Remover role admin se existir
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (roleError) {
          console.error('Role deletion error:', roleError);
          throw roleError;
        }
      }

      return { userId, fullName, isAdmin };
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    }
  });

  // Aprovar usuário
  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Approving user:', userId);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Approve error:', error);
        throw error;
      }

      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário aprovado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      console.error('Error approving user:', error);
      toast.error(`Erro ao aprovar usuário: ${error.message}`);
    }
  });

  // Congelar usuário
  const freezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Freezing user:', userId);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'frozen',
          frozen_by: currentUser?.id,
          frozen_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Freeze error:', error);
        throw error;
      }

      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário congelado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      console.error('Error freezing user:', error);
      toast.error(`Erro ao congelar usuário: ${error.message}`);
    }
  });

  // Descongelar usuário
  const unfreezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Unfreezing user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          frozen_by: null,
          frozen_at: null
        })
        .eq('id', userId);

      if (error) {
        console.error('Unfreeze error:', error);
        throw error;
      }

      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário descongelado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      console.error('Error unfreezing user:', error);
      toast.error(`Erro ao descongelar usuário: ${error.message}`);
    }
  });

  // Deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user:', userId);
      
      // Deletar roles primeiro
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error('Role deletion error:', roleError);
        throw roleError;
      }

      // Deletar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        throw profileError;
      }

      // Deletar usuário do auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.error('Auth deletion error:', authError);
        throw authError;
      }
    },
    onSuccess: () => {
      toast.success('Usuário deletado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      toast.error(`Erro ao deletar usuário: ${error.message}`);
    }
  });

  return {
    users,
    isLoading,
    refetch,
    createUserMutation,
    updateUserMutation,
    approveUserMutation,
    freezeUserMutation,
    unfreezeUserMutation,
    deleteUserMutation
  };
};
