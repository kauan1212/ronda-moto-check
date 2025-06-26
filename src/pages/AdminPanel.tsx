
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Trash2, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { signUp, signOut } = useAuth();

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error('Erro ao criar usuário: ' + error.message);
        }
      } else {
        toast.success('Usuário criado com sucesso!');
        setDialogOpen(false);
        setEmail('');
        setPassword('');
        setFullName('');
        fetchProfiles();
      }
    } catch (error: any) {
      toast.error('Erro inesperado: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userEmail}"?`)) {
      return;
    }

    try {
      // Note: In a real app, you'd need an admin function to delete users
      // For now, we'll just show a message
      toast.error('Funcionalidade de exclusão de usuários não implementada ainda');
    } catch (error: any) {
      toast.error('Erro ao excluir usuário: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error: any) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png" 
                alt="Grupo Celdan Facilities" 
                className="h-8 w-8 rounded"
              />
              <h1 className="text-xl font-bold text-slate-800 ml-3">
                Painel Administrativo
              </h1>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciamento de Usuários ({profiles.length})
                </CardTitle>
                <CardDescription>
                  Gerencie os usuários do sistema
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do novo usuário
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={creating}>
                        {creating ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div key={profile.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{profile.full_name || 'Nome não informado'}</p>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                    <p className="text-xs text-gray-500">
                      Criado em: {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.is_admin ? 'default' : 'secondary'}>
                      {profile.is_admin ? 'Admin' : 'Usuário'}
                    </Badge>
                    {!profile.is_admin && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteUser(profile.id, profile.email)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {profiles.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhum usuário encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
