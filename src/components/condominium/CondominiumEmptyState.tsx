
import React from 'react';
import { Building2 } from 'lucide-react';

const CondominiumEmptyState = () => {
  return (
    <div className="col-span-full text-center py-8 sm:py-12">
      <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">
        Nenhum condomínio cadastrado
      </h3>
      <p className="text-sm sm:text-base text-slate-500 mb-4 px-4">
        Comece criando seu primeiro condomínio
      </p>
    </div>
  );
};

export default CondominiumEmptyState;
