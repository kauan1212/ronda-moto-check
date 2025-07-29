import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Search, User, Shield, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  account_status: 'pending' | 'active' | 'frozen';
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  frozen_at: string | null;
  frozen_by: string | null;
  logo_url: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const UserQuery = () => {
  const [email, setEmail] = useState('testedesistema01@gmail.com');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{
    profile: UserProfile | null;
    roles: UserRole[] | null;
  } | null>(null);

  const queryUser = async () => {
    if (!email.trim()) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    setUserData(null);

    try {
      console.log('🔍 Consultando usuário:', email);

      // Consultar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          toast.info('Usuário não encontrado na base de dados');
          setLoading(false);
          return;
        }
        throw profileError;
      }

      // Consultar roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', profile.id);

      if (rolesError) {
        console.error('Erro ao consultar roles:', rolesError);
      }

      setUserData({
        profile,
        roles: roles || null
      });

      toast.success('Usuário encontrado!');
    } catch (error) {
      console.error('Erro ao consultar usuário:', error);
      toast.error('Erro ao consultar usuário');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'frozen':
        return <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consultar Usuário
          </CardTitle>
          <CardDescription>
            Digite o email do usuário que deseja consultar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do Usuário</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
              />
              <Button onClick={queryUser} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Consultar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {userData && userData.profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">ID</Label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{userData.profile.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-sm">{userData.profile.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Nome Completo</Label>
                <p className="text-sm">{userData.profile.full_name || 'Não informado'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status da Conta</Label>
                <div className="mt-1">{getStatusBadge(userData.profile.account_status)}</div>
              </div>
            </div>

            {/* Permissões */}
            <div>
              <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permissões
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={userData.profile.is_admin ? "default" : "secondary"}>
                    {userData.profile.is_admin ? "Administrador" : "Usuário"}
                  </Badge>
                </div>
                {userData.roles && userData.roles.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Roles:</p>
                    <div className="flex gap-2 mt-1">
                      {userData.roles.map((role) => (
                        <Badge key={role.id} variant="outline">
                          {role.role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Datas */}
            <div>
              <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Datas
              </Label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Criado em</Label>
                  <p className="text-sm">{formatDate(userData.profile.created_at)}</p>
                </div>
                {userData.profile.approved_at && (
                  <div>
                    <Label className="text-xs text-gray-500">Aprovado em</Label>
                    <p className="text-sm">{formatDate(userData.profile.approved_at)}</p>
                  </div>
                )}
                {userData.profile.frozen_at && (
                  <div>
                    <Label className="text-xs text-gray-500">Bloqueado em</Label>
                    <p className="text-sm">{formatDate(userData.profile.frozen_at)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Logo URL */}
            {userData.profile.logo_url && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Logo URL</Label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                  {userData.profile.logo_url}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserQuery; 