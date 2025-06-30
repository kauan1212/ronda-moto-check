import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile, CreateUserData, UpdateUserData } from './types';
import { sanitizeFormData } from '@/utils/inputSanitizer';
import { useAuditLog } from '@/hooks/useAuditLog';

export const useSecureUserOperations = () => {
  const queryClient = useQueryClient();
  const { logSecurityEvent } = useAuditLog();

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

  // Enhanced create user with secure Edge Function
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const sanitizedData = sanitizeFormData(userData);
      
      console.log('Creating user via Edge Function');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await fetch('/functions/v1/admin-user-operations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_user',
          email: sanitizedData.email,
          password: sanitizedData.password,
          fullName: sanitizedData.fullName,
          isAdmin: sanitizedData.isAdmin
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Usuário criado com sucesso! Conta pendente de aprovação.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast.error(`Erro ao criar usuário: ${error.message}`);
    }
  });

  // Enhanced approve user with security logging
  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await logSecurityEvent('user_approved', userId);
      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário aprovado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Error approving user:', error);
      toast.error(`Erro ao aprovar usuário: ${error.message}`);
    }
  });

  // Enhanced freeze user with security logging
  const freezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'frozen',
          frozen_by: currentUser?.id,
          frozen_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await logSecurityEvent('user_frozen', userId);
      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário congelado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
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

  // Admin password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, email }: { userId: string; email: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await fetch('/functions/v1/admin-user-operations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset_password',
          userId,
          email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Email de recuperação enviado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error resetting password:', error);
      toast.error(`Erro ao enviar email de recuperação: ${error.message}`);
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
    deleteUserMutation,
    resetPasswordMutation
  };
};
