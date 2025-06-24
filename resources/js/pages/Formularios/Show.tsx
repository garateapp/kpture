// resources/js/Pages/Formularios/Show.tsx

import React from 'react';

import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

import { PageProps } from '@/types';
import { Formulario as FormularioType } from '@/types/formulario'; // Asegúrate de tener este tipo
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

// Define las props que espera esta página
interface ShowProps extends PageProps {
    formulario: FormularioType;
}

const Show: React.FC<ShowProps> = ({ auth, formulario }) => {


    // Asegúrate de que form_estructura_json sea un array de FormComponent
    const formStructure = formulario.form_estructura_json as any[];

    const handleSubmit = (formData: { [key: string]: any }) => {
        console.log("Datos del formulario enviados:", formData);
        // Aquí puedes enviar los datos al backend.
        // Usar Inertia.post para enviar los datos a un endpoint de Laravel.
        // Por ejemplo, a una ruta `formulario.submit` que manejaría el almacenamiento de los datos del formulario.

        // Ejemplo de cómo harías un post con Inertia:
        // Inertia.post(route('formularios.submit', formulario.id), formData, {
        //     onSuccess: () => {
        //         toast({
        //             title: "Formulario Enviado",
        //             description: "Sus datos han sido enviados exitosamente.",
        //         });
        //     },
        //     onError: (errors) => {
        //         console.error("Error al enviar el formulario:", errors);
        //         toast({
        //             title: "Error al enviar",
        //             description: "Hubo un problema al enviar el formulario. Intente de nuevo.",
        //             variant: "destructive",
        //         });
        //     }
        // });

        toast({
            title: "Formulario Enviado (simulado)",
            description: "Los datos se han mostrado en la consola. Implementa la lógica de envío real.",
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Gestión de Formularios', href: '/formularios' },
                { title: `Llenar Formulario: ${formulario.nombre}`, href: '#' },
            ]}
        >
            <Head title={`Llenar Formulario: ${formulario.nombre}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{formulario.nombre}</CardTitle>
                            <CardDescription>
                                Tipo: {formulario.tipo_formulario?.nombre || 'N/A'} |
                                Estado: {formulario.estado?.nombre || 'N/A'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormRenderer
                                formStructure={formStructure}
                                onSubmit={handleSubmit}
                                initialData={formulario.initial_data || {}} // Si tienes datos iniciales para edición
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Show;
