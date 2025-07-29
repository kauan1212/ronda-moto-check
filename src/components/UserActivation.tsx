import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, UserCheck, Building, Users, Motorcycle, CheckCircle, AlertCircle } from 'lucide-react';

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
}

interface Condominium {
  id: string;
  name: string;
  address: string;
  user_id: string;
  created_at: string;
}

interface Vigilante {
  id: string;
  name: string;
  email: string;
  condominium_id: string;
  condominium_name?: string;
}

interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  condominium_id: string;
  condominium_name?: string;
}

const UserActivation = () => {
  const [email, setEmail] = useState('testedesistema01@gmail.com');
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [userData, setUserData] = useState<{
    profile: UserProfile | null;
    condominiums: Condominium[];
    vigilantes: Vigilante[];
    motorcycles: Motorcycle[];
  } | null>(null);

  const checkUser = async () => {
    if (!email.trim()) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    setUserData(null);

    try {
      console.log('🔍 Verificando usuário:', email);

      // Verificar perfil
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

      // Verificar condomínios do usuário
      const { data: condominiums, error: condError } = await supabase
        .from('condominiums')
        .select('*')
        .eq('user_id', profile.id);

      if (condError) {
        console.error('Erro ao buscar condomínios:', condError);
      }

      // Verificar vigilantes dos condomínios do usuário
      const { data: vigilantes, error: vigError } = await supabase
        .from('vigilantes')
        .select(`
          *,
          condominiums!inner(
            id,
            name,
            user_id
          )
        `)
        .eq('condominiums.user_id', profile.id);

      if (vigError) {
        console.error('Erro ao buscar vigilantes:', vigError);
      }

      // Verificar motos dos condomínios do usuário
      const { data: motorcycles, error: motoError } = await supabase
        .from('motorcycles')
        .select(`
          *,
          condominiums!inner(
            id,
            name,
            user_id
          )
        `)
        .eq('condominiums.user_id', profile.id);

      if (motoError) {
        console.error('Erro ao buscar motos:', motoError);
      }

      setUserData({
        profile,
        condominiums: condominiums || [],
        vigilantes: vigilantes || [],
        motorcycles: motorcycles || []
      });

      toast.success('Usuário encontrado!');
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      toast.error('Erro ao verificar usuário');
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async () => {
    if (!userData?.profile) {
      toast.error('Nenhum usuário selecionado para ativar');
      return;
    }

    setActivating(true);

    try {
      console.log('🔧 Ativando usuário:', email);

      // Ativar usuário
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          frozen_at: null,
          frozen_by: null
        })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Associar condomínios sem user_id ao usuário
      const { data: updatedCondominiums, error: condUpdateError } = await supabase
        .from('condominiums')
        .update({ user_id: userData.profile.id })
        .is('user_id', null)
        .select();

      if (condUpdateError) {
        console.error('Erro ao associar condomínios:', condUpdateError);
      }

      // Recarregar dados do usuário
      await checkUser();

      toast.success('Usuário ativado com sucesso!');
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      toast.error('Erro ao ativar usuário');
    } finally {
      setActivating(false);
    }
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Ativação de Usuário
          </CardTitle>
          <CardDescription>
            Ative o usuário e restaure o acesso aos condomínios, vigilantes e motos
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
              <Button onClick={checkUser} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                Verificar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {userData && userData.profile && (
        <>
          {/* Status do Usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Status do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{userData.profile.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nome</Label>
                  <p className="text-sm">{userData.profile.full_name || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(userData.profile.account_status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Administrador</Label>
                  <p className="text-sm">{userData.profile.is_admin ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              {userData.profile.account_status !== 'active' && (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Usuário não está ativo
                    </p>
                    <p className="text-sm text-yellow-700">
                      Clique em "Ativar Usuário" para restaurar o acesso
                    </p>
                  </div>
                  <Button 
                    onClick={activateUser} 
                    disabled={activating}
                    className="ml-auto"
                  >
                    {activating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Ativar Usuário
                  </Button>
                </div>
              )}

              {userData.profile.account_status === 'active' && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Usuário está ativo e pode acessar o sistema
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Resumo de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Condomínios */}
                <div className="text-center p-4 border rounded-lg">
                  <Building className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-lg">{userData.condominiums.length}</h3>
                  <p className="text-sm text-gray-600">Condomínios</p>
                  {userData.condominiums.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {userData.condominiums.map(cond => (
                        <div key={cond.id}>• {cond.name}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vigilantes */}
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-lg">{userData.vigilantes.length}</h3>
                  <p className="text-sm text-gray-600">Vigilantes</p>
                  {userData.vigilantes.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {userData.vigilantes.slice(0, 3).map(vig => (
                        <div key={vig.id}>• {vig.name}</div>
                      ))}
                      {userData.vigilantes.length > 3 && (
                        <div>... e mais {userData.vigilantes.length - 3}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Motos */}
                <div className="text-center p-4 border rounded-lg">
                  <Motorcycle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-lg">{userData.motorcycles.length}</h3>
                  <p className="text-sm text-gray-600">Motos</p>
                  {userData.motorcycles.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {userData.motorcycles.slice(0, 3).map(moto => (
                        <div key={moto.id}>• {moto.brand} {moto.model}</div>
                      ))}
                      {userData.motorcycles.length > 3 && (
                        <div>... e mais {userData.motorcycles.length - 3}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes dos Condomínios */}
          {userData.condominiums.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Condomínios ({userData.condominiums.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userData.condominiums.map(condominium => (
                    <div key={condominium.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{condominium.name}</h4>
                        <p className="text-sm text-gray-600">{condominium.address}</p>
                      </div>
                      <Badge variant="outline">
                        {formatDate(condominium.created_at)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivation; 