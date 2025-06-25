
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Condominium } from '@/types';
import { toast } from 'sonner';

interface CondominiumSelectorProps {
  onSelect: (condominium: Condominium) => void;
}

const CondominiumSelector = ({ onSelect }: CondominiumSelectorProps) => {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCondominiums();
  }, []);

  const fetchCondominiums = async () => {
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .order('name');

      if (error) throw error;

      setCondominiums(data || []);
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error);
      toast.error('Erro ao carregar condomínios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando condomínios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/placeholder.svg" 
              alt="Logo" 
              className="h-16 w-16 rounded-lg shadow-lg"
            />
            <h1 className="text-4xl font-bold text-slate-800 ml-4">
              Sistema de Vigilância
            </h1>
          </div>
          <p className="text-xl text-slate-600 mb-8">
            Selecione o condomínio para acessar o painel administrativo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {condominiums.map((condominium) => (
            <Card 
              key={condominium.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  {condominium.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {condominium.address && (
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-slate-400" />
                    <span>{condominium.address}</span>
                  </div>
                )}
                {condominium.phone && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{condominium.phone}</span>
                  </div>
                )}
                {condominium.email && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{condominium.email}</span>
                  </div>
                )}
                <Button 
                  onClick={() => onSelect(condominium)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Acessar Painel
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CondominiumSelector;
