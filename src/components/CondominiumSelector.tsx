
import React from 'react';
import CondominiumManagement from './CondominiumManagement';
import { Condominium } from '@/types';

interface CondominiumSelectorProps {
  onSelect: (condominium: Condominium) => void;
}

const CondominiumSelector = ({ onSelect }: CondominiumSelectorProps) => {
  return <CondominiumManagement onSelect={onSelect} />;
};

export default CondominiumSelector;
