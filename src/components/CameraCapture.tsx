
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Upload } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsVideoReady(false);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Detectar se é mobile para usar configurações otimizadas
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: isMobile ? { ideal: 1280, max: 1920 } : { ideal: 1280 },
          height: isMobile ? { ideal: 720, max: 1080 } : { ideal: 720 }
        },
        audio: false
      };

      console.log('Tentando acessar câmera:', constraints);

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Configurações essenciais para mobile
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        // Aguardar o vídeo carregar completamente
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        // Aguardar metadados carregarem
        await new Promise((resolve) => {
          if (videoRef.current) {
            const onLoadedMetadata = () => {
              console.log('Vídeo pronto:', {
                videoWidth: videoRef.current?.videoWidth,
                videoHeight: videoRef.current?.videoHeight,
                readyState: videoRef.current?.readyState
              });
              setIsVideoReady(true);
              resolve(true);
            };
            
            if (videoRef.current.readyState >= 1) {
              onLoadedMetadata();
            } else {
              videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setError('Câmera não disponível. Use a opção galeria.');
      setIsVideoReady(false);
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

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      console.error('Vídeo não está pronto para captura');
      setError('Aguarde o carregamento da câmera');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Contexto do canvas não disponível');
      return;
    }

    // Obter dimensões reais do vídeo
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (videoWidth === 0 || videoHeight === 0) {
      console.error('Dimensões do vídeo inválidas');
      setError('Erro na captura. Tente novamente.');
      return;
    }
    
    console.log('Capturando com dimensões:', { videoWidth, videoHeight });
    
    // Configurar canvas
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Desenhar frame atual do vídeo
    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    // Converter para base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setCapturedImage(imageData);
    setIsCapturing(true);
    setError(null);
    
    console.log('Foto capturada com sucesso');
  }, [isVideoReady]);

  const confirmCapture = () => {
    if (capturedImage) {
      console.log('Confirmando captura');
      onCapture(capturedImage);
      cleanup();
    }
  };

  const retakePhoto = () => {
    console.log('Refazendo foto');
    setCapturedImage(null);
    setIsCapturing(false);
    setError(null);
  };

  const switchCamera = () => {
    console.log('Trocando câmera');
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const cleanup = () => {
    console.log('Limpando recursos');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setIsCapturing(false);
    setError(null);
    setIsVideoReady(false);
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
      <div className="flex justify-between items-center p-4 bg-black/80 text-white">
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
        {stream && !error && !isCapturing && (
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
      <div className="flex-1 relative overflow-hidden bg-black">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8">
            <p className="text-center mb-6 text-red-300">{error}</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 mb-4"
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              Selecionar da Galeria
            </Button>
            <Button
              onClick={startCamera}
              variant="outline"
              className="text-white border-white hover:bg-white/20"
            >
              Tentar Câmera Novamente
            </Button>
          </div>
        ) : !isCapturing ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
              style={{ backgroundColor: '#000' }}
            />
            {!isVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Carregando câmera...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={capturedImage || ''}
            alt="Foto capturada"
            className="w-full h-full object-cover"
          />
        )}
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80">
        {!isCapturing ? (
          <div className="flex justify-center items-center space-x-4">
            {isVideoReady && !error && (
              <Button
                size="lg"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center"
              >
                <Camera className="h-8 w-8" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="text-white border-white hover:bg-white/20"
            >
              <Upload className="h-4 w-4 mr-2" />
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default CameraCapture;
