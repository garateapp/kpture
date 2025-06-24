// resources/js/Pages/ResponderFormulario/MisRespuestasShow.tsx

import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react'; // Importa useForm
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
//import FormRenderer from '@/Components/FormRenderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from 'lucide-react';

// Re-importa las definiciones de tipos si no están globalizadas o usa las de FormRenderer
interface FormComponent {
    id: string;
    type: string;
    props: { [key: string]: any };
    children?: FormComponent[];
}

interface FormularioOriginal {
    id: number;
    nombre: string;
    identificador: string;
    form_estructura_json: FormComponent[];
    permite_edicion: boolean; // Asegúrate de que este campo venga del backend
}

interface SubmittedFormDetail {
    id: number;
    form_id: number;
    user_id: number;
    content: { [key: string]: any };
    created_at: string;
    updated_at: string;
    form: FormularioOriginal;
}

interface MisRespuestasShowProps extends PageProps {
    submittedForm: SubmittedFormDetail;
}

const MisRespuestasShow: React.FC<MisRespuestasShowProps> = ({ submittedForm, flash }) => {
console.log("Datos del formulario enviado:", submittedForm);

    // Estado local para los datos del formulario si se permite editar
   const { data, setData, patch, processing, errors: inertiaErrors, recentlySuccessful } = useForm({
        // Inicializamos con submittedForm.content, pero también se actualiza vía onDataChange
        content: submittedForm.content || {},
    });

    // Parsear la estructura del formulario original
    const parsedFormStructure = useMemo(() => {
        if (typeof submittedForm.form.form_estructura_json === 'string' && submittedForm.form.form_estructura_json) {
            try {
                const parsed = JSON.parse(submittedForm.form.form_estructura_json);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
                console.error("Parsed form_estructura_json is not an array:", parsed);
                return [];
            } catch (e) {
                console.error("Error parsing form_estructura_json:", e);
                return [];
            }
        }
        if (Array.isArray(submittedForm.form.form_estructura_json)) {
            return submittedForm.form.form_estructura_json;
        }
        return [];
    }, [submittedForm.form.form_estructura_json]);

    const isEditable = submittedForm.form.permite_edicion;
    // Manejar el envío de la actualización del formulario
    const handleFormUpdate = async (formDataFromRenderer: { [fieldId: string]: any }) => {
        console.log("Datos para actualizar (formDataFromRenderer):", formDataFromRenderer);
        console.log("Datos que se enviarán:", data.content);
        setData('content', formDataFromRenderer); // Actualiza el estado 'content' de useForm
        data.content = formDataFromRenderer; // Asegúrate de que data.content tenga los datos actualizados
        // Usa patch para enviar la actualización a la ruta de actualización
        patch(route('submitted-forms.update', submittedForm.id), {
            onSuccess: () => {
                toast({
                    title: "Respuesta actualizada",
                    description: flash.success || "La respuesta del formulario ha sido actualizada exitosamente.",
                });
            },
            onError: (errors) => {
                console.error("Errores al actualizar:", errors);
                toast({
                    title: "Error al actualizar",
                    description: flash.error?.general || "Hubo un problema al actualizar la respuesta.",
                    variant: "destructive",
                });
            },
        });
    };
     // Función para manejar los cambios de datos desde FormRenderer y actualizar el estado de useForm
    const handleDataChangeFromRenderer = (newData: any) => {
        setData('content', newData); // ¡Esto es clave! Actualiza el estado 'content' de useForm
    };
    // Muestra un toast de éxito si la operación fue reciente y exitosa
    React.useEffect(() => {
        if (recentlySuccessful && flash.success) {
            toast({
                title: "Éxito",
                description: flash.success,
            });
        }
    }, [recentlySuccessful, flash.success, toast]);


    return (
        <AppLayout>
            <Head title={`Respuesta: ${submittedForm.form.nombre}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button asChild variant="outline">
                            <Link href={route('formularios.mis-respuestas')} className="flex items-center">
                                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                                Volver a Mis Respuestas
                            </Link>
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Respuesta para: {submittedForm.form.nombre}</CardTitle>
                            <CardDescription>
                                Identificador del Formulario: {submittedForm.form.identificador}
                                <br />
                                Creado el: {new Date(submittedForm.created_at).toLocaleString('es-ES')}
                                {isEditable && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        Editable
                                    </span>
                                )}
                                {!isEditable && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        Solo Lectura
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {parsedFormStructure && parsedFormStructure.length > 0 ? (
                                <FormRenderer
                                    formStructure={parsedFormStructure}
                                    initialData={submittedForm.content} // Los datos iniciales son los que llegaron
                                    readOnly={!isEditable} // Modo de solo lectura si NO es editable
                                    onSubmit={isEditable ? handleFormUpdate : undefined} // Solo permite onSubmit si es editable
                                    isSubmitting={processing}
                                />
                            ) : (
                                <p className="text-center text-muted-foreground">La estructura de este formulario no está definida o no se pudo cargar.</p>
                            )}

                            {inertiaErrors && Object.keys(inertiaErrors).length > 0 && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    <AlertDescription>
                                        Hubo errores:
                                        <ul className="list-disc pl-5 mt-2">
                                            {Object.values(inertiaErrors).map((message: any, index: number) => (
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

export default MisRespuestasShow;
