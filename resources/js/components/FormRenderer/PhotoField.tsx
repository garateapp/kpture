import { CameraIcon, XIcon } from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";

interface PhotoFieldProps {
  id: string;
  value: any;
  onChange: (file: File | null) => void;
  readOnly: boolean;
  error?: string;
}

const PhotoField: React.FC<PhotoFieldProps> = ({
  id,
  value,
  onChange,
  readOnly,
  error,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraActive(true);
      setCameraError("");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError("No se pudo acceder a la cámara. Asegúrese de permitir el acceso.");
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          try {
            setIsUploading(true);

            // Convertir blob a File
            const file = new File([blob], "photo.png", { type: "image/png" });

            // Crear FormData para subir
            const formData = new FormData();
            formData.append("photo", file);

            // Subir a Laravel
            const response = await axios.post(route('photos.upload'), formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            // Guardar la URL de la imagen
            onChange(response.data.url);
          } catch (error) {
            console.error("Error uploading photo:", error);
            setCameraError("Error al subir la foto. Intente de nuevo.");
          } finally {
            setIsUploading(false);
            stopCamera();
          }
        }
      }, "image/png");
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Foto tomada"
            className="max-w-xs border rounded-md"
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : isCameraActive ? (
        <div className="space-y-2">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-w-xs border rounded-md"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={takePhoto}
              disabled={isUploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUploading ? "Subiendo..." : "Tomar foto"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              disabled={isUploading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          onClick={startCamera}
          disabled={readOnly || isUploading}
        >
          <CameraIcon className="mr-2 h-4 w-4" />
          Activar cámara
        </Button>
      )}

      {cameraError && (
        <p className="text-sm text-red-500 mt-2">{cameraError}</p>
      )}
    </div>
  );
};



export default PhotoField;
