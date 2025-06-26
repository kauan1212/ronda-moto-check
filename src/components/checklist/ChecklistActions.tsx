
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download } from 'lucide-react';

interface ChecklistActionsProps {
  onSave: () => void;
  onGeneratePDF: () => void;
  isSaving: boolean;
  canSave: boolean;
  canGeneratePDF: boolean;
}

const ChecklistActions = ({ 
  onSave, 
  onGeneratePDF, 
  isSaving, 
  canSave, 
  canGeneratePDF 
}: ChecklistActionsProps) => {
  return (
    <div className="flex gap-4 pt-6">
      <Button 
        onClick={onSave} 
        className="flex-1 flex items-center gap-2"
        disabled={!canSave || isSaving}
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Salvando...' : 'Salvar Checklist'}
      </Button>
      
      <Button 
        onClick={onGeneratePDF} 
        variant="outline" 
        className="flex items-center gap-2"
        disabled={!canGeneratePDF}
      >
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
};

export default ChecklistActions;
