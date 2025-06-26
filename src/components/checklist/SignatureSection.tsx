
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignatureSectionProps {
  signature: string;
  onCaptureClick: () => void;
}

const SignatureSection = ({ signature, onCaptureClick }: SignatureSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assinatura do Vigilante</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          onClick={onCaptureClick}
          className="flex items-center gap-2"
        >
          Adicionar Assinatura
        </Button>
        
        {signature && (
          <div className="mt-4">
            <img 
              src={signature} 
              alt="Assinatura" 
              className="w-64 h-32 object-contain border rounded-lg bg-white"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignatureSection;
