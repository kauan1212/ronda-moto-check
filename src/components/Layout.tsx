
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
            {/* Back button - mobile: col-span-2, desktop: col-span-1 */}
            <div className="col-span-2 sm:col-span-1 flex justify-start">
              {onBack && (
                <Button 
                  onClick={onBack}
                  variant="outline" 
                  size="sm"
                  className="p-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Voltar</span>
                </Button>
              )}
            </div>

            {/* Logo and Title - mobile: col-span-6, desktop: col-span-8 */}
            <div className="col-span-6 sm:col-span-8 flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <img 
                src="/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png" 
                alt="Logo" 
                className="h-6 w-6 sm:h-8 sm:w-8 rounded flex-shrink-0"
              />
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-800 truncate">
                {title}
              </h1>
            </div>
            
            {/* Action buttons - mobile: col-span-4, desktop: col-span-3 */}
            <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1 sm:gap-2">
              {/* Install button - only desktop */}
              {isInstallable && (
                <Button 
                  onClick={handleInstall}
                  variant="outline"
                  className="hidden lg:flex items-center gap-2"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  Instalar
                </Button>
              )}
              
              {/* Copy link button */}
              <Button 
                onClick={copyVigilanteLink}
                variant="outline"
                className="p-2 sm:px-3"
                size="sm"
                title="Copiar Link do Vigilante"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline ml-1">Link</span>
              </Button>
              
              {/* Vigilante area button */}
              <Button 
                onClick={() => window.location.href = '/vigilante-checklist'}
                className="bg-green-600 hover:bg-green-700 p-2 sm:px-3"
                size="sm"
                title="Área do Vigilante"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Vigilante</span>
              </Button>
              
              {/* Logout button */}
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="p-2 sm:px-3"
                size="sm"
                title="Sair"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline ml-1">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
