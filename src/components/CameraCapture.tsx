
import React, { useRef, useState, useCallback } from 'react';
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar a câmera. Verifique as permissões.');
    }
  }, [facingMode, stream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
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
  };

  React.useEffect(() => {
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
        <Button
          variant="ghost"
          size="icon"
          onClick={switchCamera}
          className="text-white hover:bg-white/20"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        {!isCapturing ? (
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
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black"
            >
              <Camera className="h-8 w-8" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={retakePhoto}
              className="flex-1 max-w-xs"
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
