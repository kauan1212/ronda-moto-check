
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Copy, LogOut, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { usePWA } from '@/hooks/usePWA';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}

const Layout = ({ children, title, onBack }: LayoutProps) => {
  const { signOut } = useAuth();
  const { isInstallable, promptInstall } = usePWA();

  const copyVigilanteLink = () => {
    const vigilanteUrl = `${window.location.origin}/vigilante-checklist`;
    navigator.clipboard.writeText(vigilanteUrl).then(() => {
      toast.success('Link da área do vigilante copiado!');
    }).catch(() => {
      toast.error('Erro ao copiar link');
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirecionar para a página de login
      window.location.href = '/';
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      toast.success('App instalado com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 safe-area-inset-top safe-area-inset-bottom">
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {onBack && (
                <Button 
                  onClick={onBack}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
              )}
              <div className="flex items-center min-w-0 flex-1">
                <img 
                  src="/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png" 
                  alt="Grupo Celdan Facilities" 
                  className="h-8 w-8 rounded shrink-0"
                />
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 ml-3 truncate">
                  {title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {isInstallable && (
                <Button 
                  onClick={handleInstall}
                  variant="outline"
                  className="hidden sm:flex items-center gap-2"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  Instalar App
                </Button>
              )}
              
              <Button 
                onClick={copyVigilanteLink}
                variant="outline"
                className="flex items-center gap-1 sm:gap-2"
                size="sm"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copiar Link</span>
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/vigilante-checklist'}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-1 sm:gap-2"
                size="sm"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Área do Vigilante</span>
                <span className="sm:hidden">Vigilante</span>
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-1 sm:gap-2"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
