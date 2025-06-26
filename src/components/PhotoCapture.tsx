
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check } from 'lucide-react';

interface PhotoCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
  maxPhotos?: number;
  capturedPhotos?: string[];
}

const PhotoCapture = ({ 
  onCapture, 
  onCancel, 
  title = "Capturar Foto",
  maxPhotos = 1,
  capturedPhotos = []
}: PhotoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isReady, setIsReady] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const requestCameraPermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permission.state === 'granted') {
        setPermissionGranted(true);
        return true;
      }
      
      if (permission.state === 'prompt') {
        setShowPermissionDialog(true);
        return false;
      }
      
      if (permission.state === 'denied') {
        setShowPermissionDialog(true);
        return false;
      }
      
      return false;
    } catch (error) {
      setShowPermissionDialog(true);
      return false;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsReady(false);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      console.log('Iniciando câmera com configurações:', constraints);

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPermissionGranted(true);
      setShowPermissionDialog(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Câmera pronta');
          setIsReady(true);
        };
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setPermissionGranted(false);
      setShowPermissionDialog(true);
    }
  }, [facingMode, stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isReady) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (videoWidth === 0 || videoHeight === 0) {
      return;
    }
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(imageData);
  }, [isReady]);

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      cleanup();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
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
    setIsReady(false);
  };

  const handlePermissionRequest = async () => {
    try {
      await startCamera();
    } catch (error) {
      setPermissionGranted(false);
      setShowPermissionDialog(false);
    }
  };

  useEffect(() => {
    const initCamera = async () => {
      const hasPermission = await requestCameraPermission();
      if (hasPermission) {
        startCamera();
      }
    };
    
    initCamera();
    
    return cleanup;
  }, [requestCameraPermission, startCamera]);

  useEffect(() => {
    if (permissionGranted && !capturedImage) {
      startCamera();
    }
  }, [facingMode, permissionGranted, capturedImage, startCamera]);

  if (showPermissionDialog) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <Camera className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Permissão da Câmera</h3>
          <p className="text-gray-600 mb-6">
            Este aplicativo precisa de acesso à câmera para capturar fotos.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePermissionRequest}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Permitir Câmera
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black/90 text-white">
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
        {permissionGranted && !capturedImage && (
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

      {maxPhotos > 1 && (
        <div className="bg-black/90 text-white text-center py-2">
          <span className="text-sm">
            {capturedPhotos.length} / {maxPhotos} fotos
          </span>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden bg-black">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {!isReady && permissionGranted && (
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
            src={capturedImage}
            alt="Foto capturada"
            className="w-full h-full object-cover"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6 bg-black/90">
        {!capturedImage ? (
          <div className="flex justify-center items-center">
            {isReady && permissionGranted && (
              <Button
                size="lg"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center"
              >
                <Camera className="h-8 w-8" />
              </Button>
            )}
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
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
