
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Trash2, Image } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LogoManagement = () => {
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/58e9a05f-630d-4258-b9fa-3d590648ad6c.png');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      loadUserLogo();
    }
  }, [user]);

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
        setLogoUrl('/lovable-uploads/58e9a05f-630d-4258-b9fa-3d590648ad6c.png');
      }
    } catch (error) {
      console.error('Erro ao carregar logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

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
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao salvar logo:', error);
          toast.error('Erro ao salvar logo');
          return;
        }

        setLogoUrl(imageData);
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ logo_url: null })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao remover logo:', error);
        toast.error('Erro ao remover logo');
        return;
      }

      setLogoUrl('/lovable-uploads/58e9a05f-630d-4258-b9fa-3d590648ad6c.png');
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
          Gerenciar Logo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            A logo será exibida na sua tela de login. Recomendamos imagens em formato PNG ou JPG com fundo transparente.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label>Logo Atual</Label>
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
                disabled={uploading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : 'Alterar Logo'}
              </Button>
              {logoUrl !== '/lovable-uploads/58e9a05f-630d-4258-b9fa-3d590648ad6c.png' && (
                <Button
                  variant="destructive"
                  onClick={removeLogo}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usar Padrão
                </Button>
              )}
            </div>
          </div>
        </div>

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
