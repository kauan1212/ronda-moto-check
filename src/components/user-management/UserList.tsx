
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Mail, User, Calendar, Edit } from 'lucide-react';
import { UserProfile } from './types';

interface UserListProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
  onDelete: (userId: string) => void;
  deleteLoading?: boolean;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onEdit,
  onDelete,
  deleteLoading = false
}) => {
  const handleDelete = (userId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
      onDelete(userId);
    }
  };

  return (
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
  );
};

export default UserList;
