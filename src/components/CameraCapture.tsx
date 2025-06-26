
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const CameraCapture = ({ onCapture, onCancel, title = "Capturar Foto" }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [showFileInput, setShowFileInput] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Primeiro tenta câmera com configurações específicas
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.log('Tentativa específica falhou, tentando configuração básica:', error);
        // Fallback para configuração mais simples
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
      }

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      // Se não conseguir acessar a câmera, mostra opção de arquivo
      setShowFileInput(true);
    }
  }, [facingMode, stream]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        setIsCapturing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Define dimensões do canvas baseado no vídeo
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    // Desenha a imagem do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Converte para base64 com qualidade otimizada
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    
    setCapturedImage(imageData);
    setIsCapturing(true);
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      cleanup();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    setShowFileInput(false);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setIsCapturing(false);
    setShowFileInput(false);
  };

  useEffect(() => {
    startCamera();
    
    return () => {
      cleanup();
    };
  }, [startCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50 text-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            cleanup();
            onCancel();
          }}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
        <h2 className="text-lg font-semibold">{title}</h2>
        {!showFileInput && (
          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Camera/Image view */}
      <div className="flex-1 relative overflow-hidden">
        {showFileInput ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8">
            <p className="text-center mb-4">
              Não foi possível acessar a câmera. Selecione uma foto da galeria:
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Selecionar Foto
            </Button>
          </div>
        ) : !isCapturing ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        ) : (
          <img
            src={capturedImage || ''}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        {!isCapturing ? (
          <div className="flex justify-center space-x-4">
            {!showFileInput && (
              <Button
                size="lg"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black"
              >
                <Camera className="h-8 w-8" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setShowFileInput(!showFileInput);
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className="text-white border-white hover:bg-white/20"
            >
              Galeria
            </Button>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={retakePhoto}
              className="flex-1 max-w-xs text-white border-white hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refazer
            </Button>
            <Button
              onClick={confirmCapture}
              className="flex-1 max-w-xs bg-green-600 hover:bg-green-700"
            >
              Confirmar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
