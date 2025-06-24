// resources/js/Pages/ResponderFormulario/Show.tsx

import React,{useEffect,useMemo }  from 'react';

import { Head ,useForm,router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
//import FormRenderer from '@/Components/FormRenderer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Alert,  AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

// Re-importa las definiciones de tipos si no están globalizadas
type ComponentType =
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "phone"
    | "date"
    | "time"
    | "datetime"
    | "select"
    | "checklist"
    | "radio"
    | "checkbox"
    | "signature"
    | "qr_scanner"
    | "photo"
    | "file"
    | "section"
    | "static_text"
    | "divider";

interface ConditionalRule {
    id: string;
    targetFieldId: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'not like';
    value: string | number | boolean;
    action: 'skip' | 'hide' | 'show';
}

interface FormComponent {
    id: string;
    type: ComponentType;
    props: { [key: string]: any };
    validation?: { [key: string]: any };
    options?: { value: string; label: string }[];
    children?: FormComponent[];
    conditionalRules?: ConditionalRule[];
}

interface FormularioShowProps extends PageProps {
    formulario: {
        id: number;
        nombre: string;
        identificador: string;
        form_estructura_json: FormComponent[]; // Ya viene como array gracias al cast en el modelo
        estado: { nombre: string };
        tipo_formulario: { nombre: string };
        user: { name: string };
        created_at: string;
    };
}

const ResponderFormularioShow: React.FC<FormularioShowProps> = ({ formulario }) => {



    const parsedFormStructure = useMemo(() => {
        if (typeof formulario.form_estructura_json === 'string' && formulario.form_estructura_json) {
            try {
                const parsed = JSON.parse(formulario.form_estructura_json);
                // Asegurarse de que el resultado sea un array
                if (Array.isArray(parsed)) {
                    return parsed;
                }
                console.error("Parsed form_estructura_json is not an array:", parsed);
                return []; // Devuelve un array vacío si no es un array válido
            } catch (e) {
                console.error("Error parsing form_estructura_json:", e);
                return []; // Devuelve un array vacío en caso de error de parseo
            }
        }
        // Si ya es un array o null/undefined, lo devolvemos directamente
        if (Array.isArray(formulario.form_estructura_json)) {
            return formulario.form_estructura_json;
        }
        return []; // Por defecto, un array vacío si no es string ni array
    }, [formulario.form_estructura_json]);

 // Usamos useForm solo para 'processing' y 'errors', no para manejar el 'content' directamente.
    const { processing, errors: inertiaErrors } = useForm({});

    const handleFormRendererSubmit = async (formDataFromRenderer: { [fieldId: string]: any }) => {
        console.log("Datos recibidos de FormRenderer (formDataFromRenderer):", formDataFromRenderer);
        console.log("JSON Stringified (antes de Inertia.post):", JSON.stringify(formDataFromRenderer));

        // Esta es la llamada más directa y explícita para enviar los datos.
        // `router.post` es la función global de Inertia para hacer solicitudes.
        router.post(route('formularios.submit', { form: formulario.id }), {
            // Pasamos el objeto de datos completo como el valor del campo 'content'
            content: formDataFromRenderer
        }, {
            onSuccess: () => {
                toast({
                    title: "Formulario enviado",
                    description: "Los datos del formulario se han guardado exitosamente.",
                });
            },
            onError: (errors) => {
                console.error("Errores de Inertia:", errors);
                toast({
                    title: "Error al enviar",
                    description: "Hubo un problema al guardar el formulario. Revisa los errores.",
                    variant: "destructive",
                });
            },
            // onStart y onFinish son gestionados por el 'processing' de useForm
            // cuando se usa el hook 'useForm' para la llamada.
            // Si usaras `Inertia.post` (directamente importado, no de useForm),
            // entonces sí necesitarías manejar `isSubmitting` con useState y estos callbacks.
        });
    };
    // Este efecto es útil para depurar y verificar que los datos se están pasando correctamente.
      useEffect(() => {
        console.log("Prop formulario en Show.tsx:", formulario);
        console.log("form_estructura_json original en Show.tsx:", formulario.form_estructura_json);
        console.log("parsedFormStructure en Show.tsx:", parsedFormStructure);
        console.log("Tipo de parsedFormStructure:", typeof parsedFormStructure, Array.isArray(parsedFormStructure));
    }, [formulario, parsedFormStructure]);




    // Para guardar un borrador (opcional)
    const handleSaveDrafit = async (formDataFromRenderer: { [fieldId: string]: any }) => {
        // Aquí podrías implementar la lógica para guardar un borrador.
        // Esto implicaría otro endpoint en Laravel (ej. PUT /formularios/{form}/draft)
        // y un nuevo campo en `submitted_forms` o una tabla separada para borradores.
        // Por simplicidad, este ejemplo solo lo registra en consola.
        console.log("Guardando borrador:", formDataFromRenderer);
        toast({
            title: "Borrador guardado",
            description: "La funcionalidad de guardar borrador está pendiente de implementación en el backend.",
        });
    };
    return (
        <AppLayout>
            <Head title={`Responder: ${formulario.nombre}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{formulario.nombre}</CardTitle>
                            <CardDescription>Identificador: {formulario.identificador}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* PASAMOS parsedFormStructure y la función onSubmit al FormRenderer */}
                            {parsedFormStructure && parsedFormStructure.length > 0 ? (
                                <FormRenderer
                                    formStructure={parsedFormStructure}
                                    onSubmit={handleFormRendererSubmit}
                                    onSave={handleSaveDrafit} // Pasa la función para guardar borrador
                                    isSubmitting={processing} // Pasa el estado de envío de Inertia
                                    // Puedes pasar initialData si quieres precargar el formulario con datos
                                    // initialData={{ field1: 'valor inicial' }}
                                />
                            ) : (
                                <p className="text-center text-muted-foreground">Este formulario no tiene una estructura definida.</p>
                            )}
                            {/* Mostrar errores generales de Inertia si los hay */}
                            {inertiaErrors && Object.keys(inertiaErrors).length > 0 && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    <AlertDescription>
                                        Hubo errores al enviar el formulario:
                                        <ul className="list-disc pl-5 mt-2">
                                            {Object.values(inertiaErrors).map((message, index) => (
                                                <li key={index}>{message}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default ResponderFormularioShow;
