
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bike, CheckCircle2, Clock, User, Camera, FileText } from 'lucide-react';

interface DashboardProps {
  onStartChecklist: () => void;
}

const Dashboard = ({ onStartChecklist }: DashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Bem-vindo */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          Bem-vindo, Vigilante
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Sistema de checklist para vigilância com motocicletas
        </p>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Motos Disponíveis
            </CardTitle>
            <Bike className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">3</div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Todas em bom estado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Rondas Hoje
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">5</div>
            <p className="text-xs text-green-700 dark:text-green-300">
              2 pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Turno Atual
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">6h</div>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Noturno 22:00-06:00
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Vigilante */}
      <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Vigilante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300">Nome:</span>
            <span className="font-medium">João Silva</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300">Matrícula:</span>
            <span className="font-medium">VIG-001</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300">Status:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Ativo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Ações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={onStartChecklist}
          size="lg" 
          className="h-20 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-6 w-6" />
            <span className="font-semibold">Iniciar Checklist</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="font-semibold">Ver Relatórios</span>
          </div>
        </Button>
      </div>

      {/* Dicas Rápidas */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <Camera className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Tire fotos claras dos itens inspecionados</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">Verifique todos os itens antes de finalizar</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-orange-600" />
            <span className="text-sm">Documente qualquer problema encontrado</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
