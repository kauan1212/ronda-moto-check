
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
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {onBack && (
                <Button 
                  onClick={onBack}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 shrink-0 px-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
              )}
              <div className="flex items-center min-w-0 flex-1 gap-2">
                <img 
                  src="/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png" 
                  alt="Grupo Celdan Facilities" 
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded shrink-0"
                />
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-800 truncate">
                  {title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {isInstallable && (
                <Button 
                  onClick={handleInstall}
                  variant="outline"
                  className="hidden lg:flex items-center gap-2"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  Instalar App
                </Button>
              )}
              
              <Button 
                onClick={copyVigilanteLink}
                variant="outline"
                className="flex items-center gap-1 px-2 sm:px-3"
                size="sm"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden md:inline">Copiar Link</span>
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/vigilante-checklist'}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-1 px-2 sm:px-3"
                size="sm"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Área do Vigilante</span>
                <span className="sm:hidden">Vigilante</span>
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-1 px-2 sm:px-3"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
