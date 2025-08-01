
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, Image } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LogoManagementProps {
  isGeneralAdmin?: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  logo_url?: string;
}

const LogoManagement = ({ isGeneralAdmin = false }: LogoManagementProps) => {
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isGeneralAdmin) {
      loadAllUsers();
    } else if (user) {
      loadUserLogo();
    }
  }, [user, isGeneralAdmin]);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, logo_url')
        .order('email');

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserLogo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('logo_url')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar logo:', error);
        return;
      }

      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      } else {
        // Use default logo if no custom logo is set
        setLogoUrl('/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png');
      }
    } catch (error) {
      console.error('Erro ao carregar logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedUserLogo = async (userId: string) => {
    try {
      const selectedUser = users.find(u => u.id === userId);
      if (selectedUser?.logo_url) {
        setLogoUrl(selectedUser.logo_url);
      } else {
        setLogoUrl('/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png');
      }
    } catch (error) {
      console.error('Erro ao carregar logo do usuário:', error);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    loadSelectedUserLogo(userId);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const targetUserId = isGeneralAdmin ? selectedUserId : user?.id;
    if (!targetUserId) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        const { error } = await supabase
          .from('profiles')
          .update({ logo_url: imageData })
          .eq('id', targetUserId);

        if (error) {
          console.error('Erro ao salvar logo:', error);
          toast.error('Erro ao salvar logo');
          return;
        }

        setLogoUrl(imageData);
        
        // Atualiza a lista de usuários se for admin geral
        if (isGeneralAdmin) {
          setUsers(prev => prev.map(u => 
            u.id === targetUserId ? { ...u, logo_url: imageData } : u
          ));
        }
        
        toast.success('Logo atualizada com sucesso!');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    const targetUserId = isGeneralAdmin ? selectedUserId : user?.id;
    if (!targetUserId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ logo_url: null })
        .eq('id', targetUserId);

      if (error) {
        console.error('Erro ao remover logo:', error);
        toast.error('Erro ao remover logo');
        return;
      }

      setLogoUrl('/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png');
      
      // Atualiza a lista de usuários se for admin geral
      if (isGeneralAdmin) {
        setUsers(prev => prev.map(u => 
          u.id === targetUserId ? { ...u, logo_url: null } : u
        ));
      }
      
      toast.success('Logo removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      toast.error('Erro ao remover logo');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="ml-2">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          {isGeneralAdmin ? 'Gerenciar Logos dos Usuários' : 'Gerenciar Logo'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            {isGeneralAdmin 
              ? 'Selecione um usuário e faça upload de uma logo personalizada para ele. A logo será exibida na tela de login do usuário.'
              : 'A logo será exibida na sua tela de login. Recomendamos imagens em formato PNG ou JPG com fundo transparente.'
            }
          </AlertDescription>
        </Alert>

        {isGeneralAdmin && (
          <div className="space-y-2">
            <Label>Selecionar Usuário</Label>
            <Select value={selectedUserId} onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((userProfile) => (
                  <SelectItem key={userProfile.id} value={userProfile.id}>
                    {userProfile.email} {userProfile.full_name && `(${userProfile.full_name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(!isGeneralAdmin || selectedUserId) && (
          <div className="space-y-4">
            <Label>Logo {isGeneralAdmin ? 'do Usuário' : 'Atual'}</Label>
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <img 
                  src={logoUrl} 
                  alt="Logo atual" 
                  className="max-h-32 max-w-full object-contain"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || (isGeneralAdmin && !selectedUserId)}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Alterar Logo'}
                </Button>
                {logoUrl !== '/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png' && (
                  <Button
                    variant="destructive"
                    onClick={removeLogo}
                    disabled={uploading || (isGeneralAdmin && !selectedUserId)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Usar Padrão
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default LogoManagement;
