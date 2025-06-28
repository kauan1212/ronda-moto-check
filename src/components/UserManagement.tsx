
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { useUserOperations } from './user-management/useUserOperations';
import { UserProfile } from './user-management/types';
import UserForm from './user-management/UserForm';
import UserList from './user-management/UserList';

const UserManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const {
    users,
    isLoading,
    createUserMutation,
    updateUserMutation,
    approveUserMutation,
    freezeUserMutation,
    unfreezeUserMutation,
    deleteUserMutation
  } = useUserOperations();

  const handleCreateUser = async (formData: any) => {
    await createUserMutation.mutateAsync({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      isAdmin: formData.isAdmin
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (formData: any) => {
    if (!editingUser) return;

    await updateUserMutation.mutateAsync({
      userId: editingUser.id,
      fullName: formData.fullName,
      isAdmin: formData.isAdmin
    });
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleApproveUser = (userId: string) => {
    approveUserMutation.mutate(userId);
  };

  const handleFreezeUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja congelar esta conta? O usuário não conseguirá mais acessar o sistema.')) {
      freezeUserMutation.mutate(userId);
    }
  };

  const handleUnfreezeUser = (userId: string) => {
    unfreezeUserMutation.mutate(userId);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingCount = users.filter(user => user.account_status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-muted-foreground">
            Crie, visualize e gerencie contas de usuário do sistema
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Criar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova conta de usuário
              </DialogDescription>
            </DialogHeader>
            
            <UserForm
              onSubmit={handleCreateUser}
              onCancel={() => setIsCreateDialogOpen(false)}
              loading={createUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          
          <UserForm
            user={editingUser}
            onSubmit={handleUpdateUser}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingUser(null);
            }}
            isEdit={true}
            loading={updateUserMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <UserList
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onApprove={handleApproveUser}
        onFreeze={handleFreezeUser}
        onUnfreeze={handleUnfreezeUser}
        deleteLoading={deleteUserMutation.isPending}
        statusLoading={approveUserMutation.isPending || freezeUserMutation.isPending || unfreezeUserMutation.isPending}
      />
    </div>
  );
};

export default UserManagement;
