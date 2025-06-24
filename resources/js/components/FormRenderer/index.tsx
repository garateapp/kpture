// resources/js/components/FormRenderer/index.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircleIcon, SaveIcon } from "lucide-react";

// Importa el componente FormField
import FormField from "./FormField";

// --- INICIO: INTERFACES (Asegúrate de que estas interfaces sean consistentes en todo tu proyecto) ---
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

interface FormRendererProps {
  formStructure: FormComponent[];
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  onSave?: (data: FormData) => void;
  allowSave?: boolean;
  readOnly?: boolean;
  showProgress?: boolean;
}
// --- FIN: INTERFACES ---


const FormRenderer: React.FC<FormRendererProps> = ({
  formStructure: initialFormStructure,
  initialData,
  onSubmit,
  onSave,
  allowSave = false,
  readOnly = false,
  showProgress = false,
}) => {
  const [formData, setFormData] = useState<FormData>(initialData || {});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
  const [skippedFields, setSkippedFields] = useState<Set<string>>(new Set());

  const [dynamicOptions, setDynamicOptions] = useState<{ [id: string]: DynamicOption[] }>({});
  const [loadingComponentIds, setLoadingComponentIds] = useState<Set<string>>(new Set());
  const fetchingInProgress = useRef<Set<string>>(new Set());

  const isRequired = useCallback((component: FormComponent) => {
    return component.validation?.required;
  }, []);

  const progress = useMemo(() => {
    const totalFields = initialFormStructure.length;
    if (totalFields === 0) return 0;

    let completedFields = 0;
    initialFormStructure.forEach((component) => {
      if (!hiddenFields.has(component.id) && !skippedFields.has(component.id)) {
        const value = formData[component.id];
        if (value !== undefined && value !== null && value !== '') {
          completedFields++;
        }
      }
    });
    return (completedFields / totalFields) * 100;
  }, [initialFormStructure, formData, hiddenFields, skippedFields]);

  const handleFieldChange = useCallback(
    (id: string, value: any) => {
      setFormData((prevData) => {
        const newData = { ...prevData, [id]: value };
        // Aquí podrías añadir updateConditionalFields(newData) si tienes esa lógica
        return newData;
      });
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[id];
        return newErrors;
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const newErrors: { [key: string]: string } = {};
      initialFormStructure.forEach((component) => {
        if (!hiddenFields.has(component.id) && !skippedFields.has(component.id)) {
          const value = formData[component.id];
          if (isRequired(component) && (value === undefined || value === null || value === "")) {
            newErrors[component.id] = `${component.props.label} es requerido.`;
          }
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      onSubmit(formData);
      setIsSubmitting(false);
    },
    [formData, initialFormStructure, isRequired, onSubmit, hiddenFields, skippedFields],
  );

  const handleSave = useCallback(() => {
    if (onSave) {
      setIsSaving(true);
      onSave(formData);
      setIsSaving(false);
    }
  }, [formData, onSave]);

  // FUNCIÓN para manejar la subida de fotos/firmas al servidor.
  // Ahora toma un parámetro 'type' para determinar la carpeta de destino en el backend.
  const handlePhotoUpload = useCallback(async (fieldId: string, base64Image: string, type: 'photo' | 'signature'): Promise<string> => {
    try {
      // @ts-ignore (si no tienes tipos para route de Ziggy)
      // La ruta ahora incluye el tipo de recurso (photo o signature)
      const response = await axios.post(route('api.upload-image', { type: type }), { // Pasa 'type' como parte de la URL/parámetros
        image: base64Image,
        fieldId: fieldId
      });
      return response.data.url;
    } catch (error) {
      console.error(`Error al subir ${type}:`, error);
      setErrors(prev => ({
        ...prev,
        [fieldId]: `Error al subir ${type}. Intenta de nuevo.`
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    const componentsToFetch = initialFormStructure.filter(
      (component) =>
        component.type === "select" &&
        component.entityName &&
        !dynamicOptions[component.id] &&
        !fetchingInProgress.current.has(component.id)
    );

    if (componentsToFetch.length > 0) {
      setLoadingComponentIds(prev => {
        const newLoadingSet = new Set(prev);
        componentsToFetch.forEach(c => {
          newLoadingSet.add(c.id);
          fetchingInProgress.current.add(c.id);
        });
        return newLoadingSet;
      });

      const fetchPromises = componentsToFetch.map(async (component) => {
        try {
          // @ts-ignore
          const url = route('form-lists.values', { entidad: component.entityName });
          const response = await axios.get(url);
          setDynamicOptions(prev => ({
            ...prev,
            [component.id]: response.data
          }));
        } catch (error) {
          console.error(`Error loading options for ${component.entityName}:`, error);
          setErrors(prev => ({
            ...prev,
            [component.id]: "Error al cargar opciones."
          }));
        } finally {
          setLoadingComponentIds(prev => {
            const currentLoading = new Set(prev);
            currentLoading.delete(component.id);
            return currentLoading;
          });
          fetchingInProgress.current.delete(component.id);
        }
      });

      Promise.all(fetchPromises);
    }
  }, [initialFormStructure, dynamicOptions, setErrors]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progreso del formulario</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {initialFormStructure.map((component) => {
          if (hiddenFields.has(component.id)) {
            return null;
          }
           // Diagnóstico: Verificar si setErrors es una función antes de pasarlo
          console.log(`FormRenderer (${component.id}): typeof setErrors is`, typeof setErrors, setErrors);
          return (
            <FormField
              key={component.id}
              component={component}
              formData={formData}
              errors={errors}
              dynamicOptions={dynamicOptions}
              loadingComponentIds={loadingComponentIds}
              handleFieldChange={handleFieldChange}
              readOnly={readOnly}
              isRequired={isRequired}
              onPhotoUpload={handlePhotoUpload} // Pasa la función de subida de imagen, ahora más genérica
               setErrors={setErrors}
            />
          );
        })}

        {!readOnly && (
          <div className="flex gap-4 pt-6">
            {allowSave && onSave && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <SaveIcon className="h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar Borrador"}
              </Button>
            )}

            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2 ml-auto">
              <CheckCircleIcon className="h-4 w-4" />
              {isSubmitting ? "Enviando..." : "Enviar Formulario"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormRenderer;
