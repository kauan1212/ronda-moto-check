
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile, CreateUserData, UpdateUserData } from './types';
import { sanitizeFormData } from '@/utils/inputSanitizer';

export const useSecureUserOperations = () => {
  const queryClient = useQueryClient();

  // Buscar todos os usuários (RLS will filter based on user permissions)
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('👥 Fetching users with RLS security...');
      
      // This query will now be filtered by RLS policies
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
      }
      
      console.log('✅ Fetched users (RLS filtered):', data?.length);
      return data as UserProfile[];
    }
  });

  // Enhanced create user with secure Edge Function
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const sanitizedData = sanitizeFormData(userData);
      
      console.log('👤 Creating user via Edge Function');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await supabase.functions.invoke('admin-user-operations', {
        body: {
          action: 'create_user',
          email: sanitizedData.email,
          password: sanitizedData.password,
          fullName: sanitizedData.fullName,
          isAdmin: sanitizedData.isAdmin
        }
      });

      console.log('📤 Edge function response:', response);

      if (response.error) {
        console.error('❌ Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to create user');
      }

      if (!response.data?.success) {
        console.error('❌ Edge function returned failure:', response.data);
        throw new Error(response.data?.error || 'Failed to create user');
      }

      // Log the security event
      await supabase
        .from('security_audit')
        .insert({
          user_id: session.user.id,
          action: 'user_created',
          details: { 
            target_email: sanitizedData.email,
            is_admin: sanitizedData.isAdmin 
          }
        });

      return response.data;
    },
    onSuccess: () => {
      toast.success('Usuário criado com sucesso! Conta pendente de aprovação.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('💥 Error creating user:', error);
      toast.error(`Erro ao criar usuário: ${error.message}`);
    }
  });

  // Enhanced update user with password support
  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUserData & { newPassword?: string }) => {
      console.log('📝 Updating user via Edge Function');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await supabase.functions.invoke('admin-user-operations', {
        body: {
          action: 'update_user',
          userId: userData.userId,
          fullName: userData.fullName,
          isAdmin: userData.isAdmin,
          newPassword: userData.newPassword
        }
      });

      console.log('📤 Update user response:', response);

      if (response.error) {
        console.error('❌ Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to update user');
      }

      if (!response.data?.success) {
        console.error('❌ Edge function returned failure:', response.data);
        throw new Error(response.data?.error || 'Failed to update user');
      }

      // Log the security event
      await supabase
        .from('security_audit')
        .insert({
          user_id: session.user.id,
          target_user_id: userData.userId,
          action: 'user_updated',
          details: { 
            is_admin: userData.isAdmin,
            password_changed: !!userData.newPassword
          }
        });

      return response.data;
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('💥 Error updating user:', error);
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    }
  });

  // Admin password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, email }: { userId: string; email: string }) => {
      console.log('🔑 Resetting password via Edge Function');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await supabase.functions.invoke('admin-user-operations', {
        body: {
          action: 'reset_password',
          userId,
          email
        }
      });

      console.log('📤 Reset password response:', response);

      if (response.error) {
        console.error('❌ Reset password error:', response.error);
        throw new Error(response.error.message || 'Failed to reset password');
      }

      if (!response.data?.success) {
        console.error('❌ Edge function returned failure:', response.data);
        throw new Error(response.data?.error || 'Failed to reset password');
      }

      // Log the security event
      await supabase
        .from('security_audit')
        .insert({
          user_id: session.user.id,
          target_user_id: userId,
          action: 'password_reset_admin',
          details: { target_email: email }
        });

      return response.data;
    },
    onSuccess: () => {
      toast.success('Email de recuperação enviado com sucesso!');
    },
    onError: (error: any) => {
      console.error('💥 Error resetting password:', error);
      toast.error(`Erro ao enviar email de recuperação: ${error.message}`);
    }
  });

  // Enhanced approve user with security logging
  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // RLS policies will automatically verify admin access
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error approving user:', error);
        throw error;
      }

      // Log the security event
      if (currentUser) {
        await supabase
          .from('security_audit')
          .insert({
            user_id: currentUser.id,
            target_user_id: userId,
            action: 'user_approved'
          });
      }

      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário aprovado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('💥 Error approving user:', error);
      
      if (error.message?.includes('row-level security')) {
        toast.error('Você não tem permissão para aprovar usuários');
      } else {
        toast.error(`Erro ao aprovar usuário: ${error.message}`);
      }
    }
  });

  // Enhanced freeze user with security logging
  const freezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // RLS policies will automatically verify admin access
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'frozen',
          frozen_by: currentUser?.id,
          frozen_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error freezing user:', error);
        throw error;
      }

      // Log the security event
      if (currentUser) {
        await supabase
          .from('security_audit')
          .insert({
            user_id: currentUser.id,
            target_user_id: userId,
            action: 'user_frozen'
          });
      }

      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário congelado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('💥 Error freezing user:', error);
      
      if (error.message?.includes('row-level security')) {
        toast.error('Você não tem permissão para congelar usuários');
      } else {
        toast.error(`Erro ao congelar usuário: ${error.message}`);
      }
    }
  });

  // Unfreeze user
  const unfreezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔓 Unfreezing user:', userId);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // RLS policies will automatically verify admin access
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          frozen_by: null,
          frozen_at: null
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Unfreeze error:', error);
        throw error;
      }

      // Log the security event
      if (currentUser) {
        await supabase
          .from('security_audit')
          .insert({
            user_id: currentUser.id,
            target_user_id: userId,
            action: 'user_unfrozen'
          });
      }

      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário descongelado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('💥 Error unfreezing user:', error);
      
      if (error.message?.includes('row-level security')) {
        toast.error('Você não tem permissão para descongelar usuários');
      } else {
        toast.error(`Erro ao descongelar usuário: ${error.message}`);
      }
    }
  });

  // Delete user with enhanced security
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🗑️ Deleting user:', userId);
      
      // Use Edge Function for secure user deletion
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await supabase.functions.invoke('admin-user-operations', {
        body: {
          action: 'delete_user',
          userId
        }
      });

      if (response.error) {
        console.error('❌ Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to delete user');
      }

      if (!response.data?.success) {
        console.error('❌ Edge function returned failure:', response.data);
        throw new Error(response.data?.error || 'Failed to delete user');
      }

      // Log the security event
      await supabase
        .from('security_audit')
        .insert({
          user_id: session.user.id,
          target_user_id: userId,
          action: 'user_deleted'
        });

      return response.data;
    },
    onSuccess: () => {
      toast.success('Usuário deletado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('💥 Error deleting user:', error);
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
    deleteUserMutation,
    resetPasswordMutation
  };
};
