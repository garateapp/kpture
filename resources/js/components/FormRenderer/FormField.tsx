// resources/js/components/FormRenderer/FormField.tsx
import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import Webcam from 'react-webcam';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CameraIcon, AlertCircleIcon, FileIcon, XIcon, PenToolIcon } from "lucide-react";
import { cn } from "@/lib/utils";


// --- INICIO: INTERFACES ---
interface ConditionalRule {
  id: string;
  targetFieldId: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "like" | "not like";
  value: string | number | boolean;
  action: "skip" | "hide" | "show";
}

interface FormComponent {
  id: string;
  type: string;
  props: { [key: string]: any };
  validation?: { [key: string]: any };
  options?: { value: string; label: string }[];
  children?: FormComponent[];
  conditionalRules?: ConditionalRule[];
  entityName?: string;
}

interface FormData {
  [fieldId: string]: any;
}

interface DynamicOption {
  value: string;
  label: string;
}

interface FormFieldProps {
  component: FormComponent;
  formData: FormData;
  errors: { [key: string]: string };
  dynamicOptions: { [id: string]: DynamicOption[] };
  loadingComponentIds: Set<string>;
  handleFieldChange: (id: string, value: any) => void;
  readOnly: boolean;
  isRequired: (component: FormComponent) => boolean;
  onPhotoUpload: (fieldId: string, base64Image: string, type: 'photo' | 'signature') => Promise<string>;
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>; // ¡NUEVO! Añade setErrors
}
// --- FIN: INTERFACES ---


const FormField: React.FC<FormFieldProps> = ({
  component,
  formData,
  errors,
  dynamicOptions,
  loadingComponentIds,
  handleFieldChange,
  readOnly,
  isRequired,
  onPhotoUpload,
  setErrors, // ¡NUEVO! Desestructura setErrors
}) => {

  console.log(`FormField (${component.id}): typeof setErrors is`, typeof setErrors, setErrors);

  const value = formData[component.id];
  const error = errors[component.id];

  const optionsToRender = component.entityName
    ? dynamicOptions[component.id] || []
    : component.options || [];

  const commonProps = {
    id: component.id,
    name: component.id,
    onValueChange: (val: string) => handleFieldChange(component.id, val),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      handleFieldChange(component.id, e.target.value),
    onCheckedChange: (checked: boolean) => handleFieldChange(component.id, checked),
    disabled: readOnly,
    readOnly: readOnly,
  };

  // --- INICIO: Lógica específica para el campo de foto ---
  const webcamRef = useRef<Webcam>(null);
  const [capturing, setCapturing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");

  const startCamera = useCallback(async () => {
    try {
      setCapturing(true);
      setCameraError("");
    } catch (err) {
      setCameraError("No se pudo acceder a la cámara. Asegúrese de permitir el acceso.");
      console.error("Error accessing camera:", err);
      setCapturing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    setCapturing(false);
    setCameraError("");
  }, []);

  const handleCapture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setUploadingPhoto(true);
        try {
          const imageUrl = await onPhotoUpload(component.id, imageSrc, 'photo');
          handleFieldChange(component.id, imageUrl);
          stopCamera();
          setErrors(prev => { // Limpia el error si la subida fue exitosa
            const newErrors = { ...prev };
            delete newErrors[component.id];
            return newErrors;
          });
        } catch (uploadError) {
          console.error("Error al subir la foto:", uploadError);
          setErrors(prev => ({
            ...prev,
            [component.id]: `Error al subir la foto: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`
          }));
        } finally {
          setUploadingPhoto(false);
        }
      } else {
        setCameraError("No se pudo tomar la foto. Intenta de nuevo.");
      }
    }
  }, [webcamRef, component.id, onPhotoUpload, handleFieldChange, stopCamera, setErrors]);

  const handleRemovePhoto = useCallback(() => {
    handleFieldChange(component.id, null);
    setErrors(prev => { // Limpia el error si la foto es eliminada
      const newErrors = { ...prev };
      delete newErrors[component.id];
      return newErrors;
    });
  }, [component.id, handleFieldChange, setErrors]);
  // --- FIN: Lógica específica para el campo de foto ---


   // --- INICIO: Lógica específica para el campo de firma ---
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  useEffect(() => {
    if (component.type === "signature" && value && sigCanvas.current) {
      setIsSigned(true);
    } else if (component.type === "signature" && !value && sigCanvas.current) {
      setIsSigned(false);
      sigCanvas.current.clear();
    }
  }, [value, component.type]);

  const clearSignature = useCallback(() => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false);
      handleFieldChange(component.id, null);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[component.id];
        return newErrors;
      });
    }
  }, [component.id, handleFieldChange, setErrors]);

  const saveSignature = useCallback(async () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      // CAMBIO AQUÍ: Usar getCanvas() en lugar de getTrimmedCanvas()
      const signatureImage = sigCanvas.current.getCanvas().toDataURL('image/png'); // ¡MODIFICADO!
      setUploadingSignature(true);
      try {
        const imageUrl = await onPhotoUpload(component.id, signatureImage, 'signature');
        handleFieldChange(component.id, imageUrl);
        setIsSigned(true);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[component.id];
          return newErrors;
        });
      } catch (uploadError) {
        console.error("Error al subir la firma:", uploadError);
        setErrors(prev => ({
          ...prev,
          [component.id]: `Error al subir la firma: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`
        }));
      } finally {
        setUploadingSignature(false);
      }
    } else {
      setErrors(prev => ({
        ...prev,
        [component.id]: "Por favor, firme en el recuadro."
      }));
    }
  }, [sigCanvas, component.id, onPhotoUpload, handleFieldChange, setErrors]);
  // --- FIN: Lógica específica para el campo de firma ---

  switch (component.type) {
    case "text":
    case "number":
    case "email":
    case "phone":
      return (
        <div key={component.id} className="space-y-2">
          <Label htmlFor={component.id}>
            {component.props.label}
            {isRequired(component) && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            {...commonProps}
            type={component.type}
            placeholder={component.props.placeholder}
            value={formData[component.id] || ""}
            onChange={commonProps.onChange}
            className={errors[component.id] ? "border-red-500" : ""}
          />
          {errors[component.id] && <AlertDescription className="text-sm text-red-500">{errors[component.id]}</AlertDescription>}
        </div>
      );
    case "textarea":
      return (
        <div key={component.id} className="space-y-2">
          <Label htmlFor={component.id}>
            {component.props.label}
            {isRequired(component) && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            {...commonProps}
            placeholder={component.props.placeholder}
            value={formData[component.id] || ""}
            onChange={commonProps.onChange}
            className={errors[component.id] ? "border-red-500" : ""}
          />
          {errors[component.id] && <AlertDescription className="text-sm text-red-500">{errors[component.id]}</AlertDescription>}
        </div>
      );
    case "date":
    case "time":
    case "datetime":
      return (
        <div key={component.id} className="space-y-2">
          <Label htmlFor={component.id}>
            {component.props.label}
            {isRequired(component) && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData[component.id] && "text-muted-foreground",
                  errors[component.id] && "border-red-500",
                )}
                disabled={readOnly}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData[component.id] ? (
                  format(new Date(formData[component.id]), component.type === "date" ? "PPP" : (component.type === "time" ? "p" : "PPPp"), { locale: es })
                ) : (
                  <span>Selecciona {component.type === "date" ? "una fecha" : (component.type === "time" ? "una hora" : "fecha y hora")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData[component.id] ? new Date(formData[component.id]) : undefined}
                onSelect={(date) => handleFieldChange(component.id, date?.toISOString() || null)}
                initialFocus
              />
              {/* Para la hora, necesitarías un componente de selección de hora */}
            </PopoverContent>
          </Popover>
          {errors[component.id] && <AlertDescription className="text-sm text-red-500">{errors[component.id]}</AlertDescription>}
        </div>
      );
    case "select":
      const isLoading = loadingComponentIds.has(component.id);
      const hasError = errors[component.id];

      return (
        <div key={component.id} className="space-y-2">
          <Label htmlFor={component.id}>
            {component.props.label}
            {isRequired(component) && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={value || ""}
            onValueChange={(val) => handleFieldChange(component.id, val)}
            disabled={readOnly || isLoading || hasError}
          >
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder={component.props.placeholder || "Seleccione una opción"} />
            </SelectTrigger>
            <SelectContent>
              {isLoading && (
                <SelectItem value="loading_placeholder" disabled>
                  Cargando opciones...
                </SelectItem>
              )}
              {!isLoading && hasError && (
                <SelectItem value="error_placeholder" disabled>
                  Error al cargar ({errors[component.id]})
                </SelectItem>
              )}
              {!isLoading && !hasError && optionsToRender
                ?.filter((option) => option.value && option.value.trim() !== "")
                ?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              {!isLoading && !hasError && optionsToRender.length === 0 && (
                <SelectItem value="no_options" disabled>
                  No hay opciones disponibles
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      );
    case "checkbox":
      return (
        <div key={component.id} className="flex items-center space-x-2">
          <Checkbox
            id={component.id}
            checked={!!formData[component.id]}
            onCheckedChange={commonProps.onCheckedChange}
            disabled={readOnly}
          />
          <Label htmlFor={component.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {component.props.label}
            {isRequired(component) && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {errors[component.id] && <AlertDescription className="text-sm text-red-500">{errors[component.id]}</AlertDescription>}
        </div>
      );
    case "radio_group":
      return (
        <div key={component.id} className="space-y-2">
          <Label htmlFor={component.id}>
            {component.props.label}
            {isRequired(component) && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <RadioGroup
            onValueChange={commonProps.onValueChange}
            value={value || ""}
            disabled={readOnly}
            className={errors[component.id] ? "border-red-500 p-2 rounded" : ""}
          >
            {component.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${component.id}-${option.value}`} />
                <Label htmlFor={`${component.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors[component.id] && <AlertDescription className="text-sm text-red-500">{errors[component.id]}</AlertDescription>}
        </div>
      );

    case "photo":
      return (
        <div key={component.id} className="space-y-2">
          <Label htmlFor={component.id}>
            {component.props.label}
            {isRequired(component) && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {value && !capturing && !uploadingPhoto ? (
            <div className="relative w-full min-h-48 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
              <img src={value} alt="Foto Capturada" className="max-w-full max-h-full object-contain" />
              {!readOnly && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button
                        onClick={() => startCamera()}
                        className="flex items-center gap-1"
                        size="sm"
                        disabled={uploadingPhoto}
                    >
                        <CameraIcon className="h-4 w-4" />
                        Cambiar Foto
                    </Button>
                    <Button
                        onClick={handleRemovePhoto}
                        variant="destructive"
                        className="flex items-center gap-1"
                        size="sm"
                        disabled={uploadingPhoto}
                    >
                        <XIcon className="h-4 w-4" />
                        Eliminar
                    </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!capturing ? (
                <Button
                  onClick={startCamera}
                  disabled={readOnly || uploadingPhoto}
                  className="w-full flex items-center gap-2"
                >
                  <CameraIcon className="h-4 w-4" />
                  {uploadingPhoto ? "Subiendo..." : "Tomar Foto"}
                </Button>
              ) : (
                <div className="border rounded-md overflow-hidden p-2 bg-black">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    videoConstraints={{ facingMode: "environment" }}
                    className="rounded-md w-full"
                  />
                  <div className="flex justify-between mt-2">
                    <Button onClick={stopCamera} variant="outline" disabled={uploadingPhoto}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCapture} disabled={uploadingPhoto}>
                      {uploadingPhoto ? "Subiendo..." : "Capturar y Subir"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {cameraError && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}
          {uploadingPhoto && <AlertDescription className="text-sm text-blue-500">Subiendo foto...</AlertDescription>}
        </div>
      );

    case "signature":
        return (
            <div key={component.id} className="space-y-2">
                <Label htmlFor={component.id}>
                  {component.props.label}
                  {isRequired(component) && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {value && !uploadingSignature ? (
                    <div className="relative w-full min-h-36 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
                        <img src={value} alt="Firma Capturada" className="max-w-full max-h-full object-contain" />
                        {!readOnly && (
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <Button
                                    onClick={clearSignature}
                                    variant="outline"
                                    className="flex items-center gap-1"
                                    size="sm"
                                >
                                    <PenToolIcon className="h-4 w-4" />
                                    Nueva Firma
                                </Button>
                                <Button
                                    onClick={() => handleFieldChange(component.id, null)}
                                    variant="destructive"
                                    className="flex items-center gap-1"
                                    size="sm"
                                >
                                    <XIcon className="h-4 w-4" />
                                    Eliminar
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative border border-dashed rounded-md bg-white">
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{
                                width: 500,
                                height: 200,
                                className: 'sigCanvas',
                                style: { touchAction: 'none', width: '100%', height: '100%' }
                            }}
                            backgroundColor="rgb(255,255,255)"
                            onEnd={() => setIsSigned(!sigCanvas.current?.isEmpty())}
                            clearOnResize={false}
                        />
                        {!readOnly && (
                            <div className="flex justify-between items-center p-2 border-t">
                                <Button
                                    onClick={clearSignature}
                                    variant="outline"
                                    disabled={!isSigned || uploadingSignature}
                                >
                                    Limpiar
                                </Button>
                                <Button
                                    onClick={saveSignature}
                                    disabled={!isSigned || uploadingSignature}
                                >
                                    {uploadingSignature ? "Subiendo..." : "Guardar Firma"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircleIcon className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {uploadingSignature && <AlertDescription className="text-sm text-blue-500">Subiendo firma...</AlertDescription>}
            </div>
        );

    default:
      return (
        <div key={component.id} className="text-red-500">
          <p>Tipo de campo no soportado: {component.type}</p>
        </div>
      );
  }
};

export default memo(FormField);
