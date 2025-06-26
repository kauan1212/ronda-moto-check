
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, UserPlus, Mail, User, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  created_at: string;
}

const UserManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  // Buscar todos os usuários
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users...');
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
    mutationFn: async ({ email, password, fullName, isAdmin }: {
      email: string;
      password: string;
      fullName: string;
      isAdmin: boolean;
    }) => {
      // Criar usuário via Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: fullName
        },
        email_confirm: true
      });

      if (authError) throw authError;

      // Atualizar perfil com status de admin se necessário
      if (isAdmin && authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        // Adicionar role de admin
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'admin'
          });

        if (roleError) throw roleError;
      }

      return authData;
    },
    onSuccess: () => {
      toast.success('Usuário criado com sucesso!');
      setIsCreateDialogOpen(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      setIsAdmin(false);
      refetch();
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast.error(`Erro ao criar usuário: ${error.message}`);
    }
  });

  // Deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newUserEmail || !newUserPassword || !newUserName) {
      setError('Todos os campos são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        email: newUserEmail,
        password: newUserPassword,
        fullName: newUserName,
        isAdmin
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-muted-foreground">
            Crie, visualize e gerencie contas de usuário do sistema
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
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nome do usuário"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="admin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="admin">Usuário administrador</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Usuários Cadastrados ({users.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os usuários registrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'Nome não informado'}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_admin ? "default" : "secondary"}>
                      {user.is_admin ? 'Administrador' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteUserMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
