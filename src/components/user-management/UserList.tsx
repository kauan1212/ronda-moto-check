
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Mail, User, Calendar, Edit } from 'lucide-react';
import { UserProfile } from './types';
import AccountStatusManager from './AccountStatusManager';

interface UserListProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
  onDelete: (userId: string) => void;
  onApprove: (userId: string) => void;
  onFreeze: (userId: string) => void;
  onUnfreeze: (userId: string) => void;
  deleteLoading?: boolean;
  statusLoading?: boolean;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onEdit,
  onDelete,
  onApprove,
  onFreeze,
  onUnfreeze,
  deleteLoading = false,
  statusLoading = false
}) => {
  const handleDelete = (userId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
      onDelete(userId);
    }
  };

  const pendingUsers = users.filter(user => user.account_status === 'pending');
  const activeUsers = users.filter(user => user.account_status === 'active');
  const frozenUsers = users.filter(user => user.account_status === 'frozen');

  return (
    <div className="space-y-6">
      {/* Usuários Pendentes */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <User className="h-5 w-5" />
              Usuários Pendentes de Aprovação ({pendingUsers.length})
            </CardTitle>
            <CardDescription>
              Estas contas precisam ser aprovadas para que os usuários possam acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'Nome não informado'}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <AccountStatusManager
                          user={user}
                          onApprove={onApprove}
                          onFreeze={onFreeze}
                          onUnfreeze={onUnfreeze}
                          loading={statusLoading}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Usuários Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Usuários Ativos ({activeUsers.length})
          </CardTitle>
          <CardDescription>
            Usuários com contas ativas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.map((user) => (
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
                  <TableCell>
                    <AccountStatusManager
                      user={user}
                      onApprove={onApprove}
                      onFreeze={onFreeze}
                      onUnfreeze={onUnfreeze}
                      loading={statusLoading}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(user)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteLoading}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Deletar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {activeUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário ativo encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usuários Congelados */}
      {frozenUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <User className="h-5 w-5" />
              Usuários Congelados ({frozenUsers.length})
            </CardTitle>
            <CardDescription>
              Contas que foram congeladas e não podem acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Congelado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frozenUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'Nome não informado'}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {user.frozen_at ? new Date(user.frozen_at).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <AccountStatusManager
                        user={user}
                        onApprove={onApprove}
                        onFreeze={onFreeze}
                        onUnfreeze={onUnfreeze}
                        loading={statusLoading}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserList;
