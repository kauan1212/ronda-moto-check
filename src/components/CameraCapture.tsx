import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check, Flashlight, FlashlightOff } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const CameraCapture = ({ onCapture, onCancel, title = "Capturar Foto" }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isFlashSupported, setIsFlashSupported] = useState(false);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  const checkFlashSupport = useCallback(async (stream: MediaStream) => {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities();
        const hasFlash = 'torch' in capabilities && (capabilities as any).torch;
        setIsFlashSupported(Boolean(hasFlash));
        console.log('Flash support:', hasFlash);
      }
    } catch (error) {
      console.log('Flash support check failed:', error);
      setIsFlashSupported(false);
    }
  }, []);

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current || !isFlashSupported) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const newFlashState = !flashEnabled;
        await videoTrack.applyConstraints({
          advanced: [{ torch: newFlashState } as any]
        });
        setFlashEnabled(newFlashState);
        console.log('Flash toggled:', newFlashState);
      }
    } catch (error) {
      console.error('Error toggling flash:', error);
    }
  }, [flashEnabled, isFlashSupported]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      cleanup();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      console.log('Solicitando acesso à câmera...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      setHasPermission(true);

      // Check flash support after getting the stream
      await checkFlashSupport(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        const loadPromise = new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          const onLoadedMetadata = () => {
            console.log('Câmera carregada com sucesso');
            setIsLoading(false);
            resolve();
          };

          const onError = () => {
            reject(new Error('Erro ao carregar vídeo'));
          };

          videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
          videoRef.current.addEventListener('error', onError);

          videoRef.current.play().catch(reject);

          setTimeout(() => {
            if (videoRef.current?.readyState >= 2) {
              onLoadedMetadata();
            }
          }, 1000);
        });

        await loadPromise;
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setHasPermission(false);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      setIsLoading(false);
    }
  }, [facingMode, cleanup, checkFlashSupport]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const { videoWidth, videoHeight } = video;
    
    if (videoWidth === 0 || videoHeight === 0) {
      return;
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
  }, []);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      cleanup();
    }
  }, [capturedImage, onCapture, cleanup]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setFlashEnabled(false); // Reset flash when switching cameras
  }, []);

  useEffect(() => {
    startCamera();
    return cleanup;
  }, [startCamera, cleanup]);

  // Turn off flash when switching to front camera
  useEffect(() => {
    if (facingMode === 'user' && flashEnabled) {
      setFlashEnabled(false);
    }
  }, [facingMode, flashEnabled]);

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <Camera className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Câmera não disponível</h3>
          <p className="text-gray-600 mb-6">
            Não foi possível acessar a câmera. Verifique as permissões do navegador.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={startCamera}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Tentar Novamente
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
        <div className="flex gap-2">
          {!isLoading && !error && !capturedImage && isFlashSupported && facingMode === 'environment' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlash}
              className={`text-white hover:bg-white/20 ${flashEnabled ? 'bg-yellow-500/20' : ''}`}
              title={flashEnabled ? 'Desligar Flash' : 'Ligar Flash'}
            >
              {flashEnabled ? (
                <Flashlight className="h-6 w-6 text-yellow-400" />
              ) : (
                <FlashlightOff className="h-6 w-6" />
              )}
            </Button>
          )}
          {!isLoading && !error && !capturedImage && (
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
      </div>

      <div className="flex-1 relative overflow-hidden bg-black">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center">
            <p className="mb-4 text-red-300">{error}</p>
            <Button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Tentar Novamente
            </Button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Foto capturada"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Carregando câmera...</p>
                </div>
              </div>
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6 bg-black/90">
        {capturedImage ? (
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
        ) : (
          <div className="flex justify-center items-center">
            {!isLoading && !error && (
              <div className="flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center"
                >
                  <Camera className="h-8 w-8" />
                </Button>
                {isFlashSupported && facingMode === 'environment' && (
                  <div className="text-white text-sm text-center">
                    Flash: {flashEnabled ? 'Ligado' : 'Desligado'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
