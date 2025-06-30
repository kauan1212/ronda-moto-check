
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserProfile } from './types';

interface UserFormProps {
  user?: UserProfile | null;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    isAdmin: user?.is_admin || false
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || (!isEdit && (!formData.email || !formData.password))) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    if (isEdit && formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (isEdit && formData.newPassword && formData.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || `Erro ao ${isEdit ? 'atualizar' : 'criar'} usuário`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          placeholder="Nome do usuário"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="email@exemplo.com"
          disabled={isEdit}
          className={isEdit ? "bg-gray-100" : ""}
          required={!isEdit}
        />
        {isEdit && (
          <p className="text-sm text-muted-foreground">O email não pode ser alterado</p>
        )}
      </div>
      
      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />
        </div>
      )}

      {isEdit && (
        <>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha (opcional)</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Deixe em branco para manter a senha atual"
              minLength={6}
            />
          </div>
          
          {formData.newPassword && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirme a nova senha"
                required
              />
            </div>
          )}
        </>
      )}
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="admin"
          checked={formData.isAdmin}
          onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="admin">Usuário administrador</Label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (isEdit ? 'Atualizando...' : 'Criando...') : (isEdit ? 'Atualizar' : 'Criar Usuário')}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
