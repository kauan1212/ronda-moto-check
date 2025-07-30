import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Edit, Trash2, MapPin, Phone, Mail, Download, FileX, X } from 'lucide-react';
import { Condominium } from '@/types';
import { toast } from 'sonner';

interface CondominiumCardProps {
  condominium: Condominium;
  onEdit: (condominium: Condominium) => void;
  onDelete: (condominium: Condominium) => void;
  onSelect: (condominium: Condominium) => void;
  canEdit: boolean;
  onExportChecklists?: (condominiumId: string) => Promise<void>;
  onDeleteChecklists?: (condominiumId: string) => Promise<void>;
  onDownloadAndDelete?: (condominiumId: string) => Promise<void>;
  showChecklistActions?: boolean;
}

const CondominiumCard = ({ 
  condominium, 
  onEdit, 
  onDelete, 
  onSelect, 
  canEdit,
  onExportChecklists,
  onDeleteChecklists,
  onDownloadAndDelete,
  showChecklistActions
}: CondominiumCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-1 top-1 h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(condominium);
        }}
      >
        <X className="h-3 w-3" />
      </Button>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center min-w-0 flex-1 pr-6">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 flex-shrink-0" />
            <span className="truncate">{condominium.name}</span>
          </div>
          {canEdit && (
            <div className="flex gap-1 flex-shrink-0 ml-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit(condominium)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDelete(condominium)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {condominium.address && (
          <div className="flex items-start text-xs sm:text-sm text-slate-600">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
            <span className="break-words">{condominium.address}</span>
          </div>
        )}
        {condominium.phone && (
          <div className="flex items-center text-xs sm:text-sm text-slate-600">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-slate-400 flex-shrink-0" />
            <span className="break-words">{condominium.phone}</span>
          </div>
        )}
        {condominium.email && (
          <div className="flex items-center text-xs sm:text-sm text-slate-600">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-slate-400 flex-shrink-0" />
            <span className="break-words">{condominium.email}</span>
          </div>
        )}
        
        {/* Botões de ações de checklist (apenas para admin geral) */}
        {showChecklistActions && (
          <div className="space-y-2 pt-3 border-t">
            <div className="text-xs font-medium text-muted-foreground">Ações de Checklist:</div>
            <div className="flex flex-col gap-1">
              {onDownloadAndDelete && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onDownloadAndDelete(condominium.id)}
                  className="bg-green-600 hover:bg-green-700 text-xs w-full"
                >
                  <Download className="h-3 w-3 mr-2" />
                  Baixar PDF e Deletar Checklists
                </Button>
              )}
              <div className="flex gap-1">
                {onExportChecklists && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExportChecklists(condominium.id)}
                    className="text-xs flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Apenas Baixar
                  </Button>
                )}
                {onDeleteChecklists && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteChecklists(condominium.id)}
                    className="text-xs flex-1"
                  >
                    <FileX className="h-3 w-3 mr-1" />
                    Apenas Deletar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <Button 
          onClick={() => onSelect(condominium)}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
        >
          Acessar Painel
        </Button>
      </CardContent>
    </Card>
  );
};

export default CondominiumCard;
