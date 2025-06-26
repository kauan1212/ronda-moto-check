
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const ChecklistHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <span className="text-sm text-gray-600">
          {new Date().toLocaleDateString('pt-BR')}
        </span>
        <Clock className="h-5 w-5 text-blue-600 ml-4" />
        <span className="text-sm text-gray-600">
          {new Date().toLocaleTimeString('pt-BR')}
        </span>
      </div>
    </div>
  );
};

export default ChecklistHeader;
