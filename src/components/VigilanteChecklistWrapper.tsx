import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import VigilanteChecklistPage from '@/pages/VigilanteChecklistPage';
import { Button } from '@/components/ui/button';

const VigilanteChecklistWrapper = () => {
  const { user, loading, forceLogout } = useAuth();

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-700">Carregando...</div>
        </div>
      </div>
    );
  }

  // Se não há usuário, redirecionar para login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  // Se o usuário é o bloqueado, mostrar mensagem de acesso negado
  if (user.email === 'testedesistemavistoria@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-red-800">Acesso Negado</h1>
          <p className="text-red-600 text-lg">
            Sua conta não tem permissão para acessar o sistema.
          </p>
          <Button onClick={forceLogout} className="mt-6" variant="outline">
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  // Se tudo estiver ok, renderizar a página de checklist
  return <VigilanteChecklistPage />;
};

export default VigilanteChecklistWrapper; 