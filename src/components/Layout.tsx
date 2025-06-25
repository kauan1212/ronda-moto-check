
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}

const Layout = ({ children, title, onBack }: LayoutProps) => {
  const copyVigilanteLink = () => {
    const vigilanteUrl = `${window.location.origin}/vigilante-checklist`;
    navigator.clipboard.writeText(vigilanteUrl).then(() => {
      toast.success('Link da área do vigilante copiado!');
    }).catch(() => {
      toast.error('Erro ao copiar link');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button 
                  onClick={onBack}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/76e5d7a2-ec38-4d25-9617-44c828e4f1f8.png" 
                  alt="Grupo Celdan Facilities" 
                  className="h-8 w-8 rounded"
                />
                <h1 className="text-xl font-bold text-slate-800 ml-3">
                  {title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={copyVigilanteLink}
                variant="outline"
                className="flex items-center gap-2"
                size="sm"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copiar Link Vigilante</span>
                <span className="sm:hidden">Link</span>
              </Button>
              <Button 
                onClick={() => window.location.href = '/vigilante-checklist'}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                size="sm"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Área do Vigilante</span>
                <span className="sm:hidden">Vigilante</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;
