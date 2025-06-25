
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, RotateCcw, Check } from 'lucide-react';

interface SignatureCaptureProps {
  onCapture: (signatureData: string) => void;
  onCancel: () => void;
}

const SignatureCapture = ({ onCapture, onCancel }: SignatureCaptureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Configurar canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Configurar estilo da linha
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Preencher fundo branco
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getEventPos(e);
    const context = canvasRef.current?.getContext('2d');
    if (context) {
      context.beginPath();
      context.moveTo(pos.x, pos.y);
    }
    e.preventDefault();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const pos = getEventPos(e);
    const context = canvasRef.current?.getContext('2d');
    if (context) {
      context.lineTo(pos.x, pos.y);
      context.stroke();
    }
    setHasSignature(true);
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const signatureData = canvas.toDataURL('image/png');
      onCapture(signatureData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle>Assinatura Digital</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
            <canvas
              ref={canvasRef}
              className="w-full h-48 bg-white rounded border cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Assine usando seu dedo ou mouse na área acima
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={clearSignature}
              className="flex-1"
              disabled={!hasSignature}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button
              onClick={saveSignature}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!hasSignature}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureCapture;
