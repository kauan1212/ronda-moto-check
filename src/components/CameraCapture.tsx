
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
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Configurações otimizadas para mobile
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: false
      };

      console.log('Tentando acessar câmera com configurações:', constraints);

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Câmera acessada com sucesso');
      } catch (error) {
        console.log('Tentativa específica falhou, tentando configuração básica:', error);
        // Fallback para configuração mais simples
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false
        });
        console.log('Câmera acessada com configuração básica');
      }

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        
        // Aguarda o vídeo estar pronto
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('Metadados do vídeo carregados');
              resolve(true);
            };
          }
        });
        
        await videoRef.current.play();
        console.log('Vídeo iniciado com sucesso');
        setShowFileInput(false);
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setError('Não foi possível acessar a câmera. Tente usar a opção de galeria.');
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
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Elementos de vídeo ou canvas não disponíveis');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Contexto do canvas não disponível');
      return;
    }

    // Define dimensões do canvas baseado no vídeo
    const videoWidth = video.videoWidth || video.clientWidth || 640;
    const videoHeight = video.videoHeight || video.clientHeight || 480;
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    console.log('Capturando foto com dimensões:', videoWidth, 'x', videoHeight);
    
    // Desenha a imagem do vídeo no canvas
    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    // Converte para base64 com qualidade otimizada
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    
    setCapturedImage(imageData);
    setIsCapturing(true);
    setError(null);
    
    console.log('Foto capturada com sucesso');
  };

  const confirmCapture = () => {
    if (capturedImage) {
      console.log('Confirmando captura da foto');
      onCapture(capturedImage);
      cleanup();
    }
  };

  const retakePhoto = () => {
    console.log('Refazendo foto');
    setCapturedImage(null);
    setIsCapturing(false);
    setShowFileInput(false);
    setError(null);
  };

  const switchCamera = () => {
    console.log('Trocando câmera');
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const cleanup = () => {
    console.log('Limpando recursos da câmera');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setIsCapturing(false);
    setShowFileInput(false);
    setError(null);
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
        {!showFileInput && !error && (
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
        {error || showFileInput ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8">
            {error && (
              <p className="text-center mb-4 text-red-300">{error}</p>
            )}
            <p className="text-center mb-4">
              Selecione uma foto da galeria:
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
              className="bg-blue-600 hover:bg-blue-700 mb-4"
            >
              Selecionar Foto
            </Button>
            {!error && (
              <Button
                onClick={startCamera}
                variant="outline"
                className="text-white border-white hover:bg-white/20"
              >
                Tentar Câmera Novamente
              </Button>
            )}
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
            {!showFileInput && !error && (
              <Button
                size="lg"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black"
                disabled={!stream}
              >
                <Camera className="h-8 w-8" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setShowFileInput(true);
                setError(null);
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
