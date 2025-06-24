// resources/js/Pages/SubmittedForms/MyResponses.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importar el locale español si no lo tienes globalmente

interface FormularioOriginal {
    id: number;
    nombre: string;
    identificador: string;
}

interface SubmittedFormItem {
    id: number;
    form_id: number;
    user_id: number;
    content: { [key: string]: any }; // Contenido del formulario (valores de los campos)
    created_at: string;
    updated_at: string;
    form: FormularioOriginal; // Relación cargada con el formulario original
}

interface MyResponsesProps extends PageProps {
    submittedForms: {
        data: SubmittedFormItem[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

const MyResponses: React.FC<MyResponsesProps> = ({ submittedForms }) => {
    return (
        <AppLayout>
            <Head title="Mis Respuestas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mis Respuestas</CardTitle>
                            <CardDescription>Aquí puedes ver todos los formularios que has completado.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {submittedForms.data.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Formulario</TableHead>
                                            <TableHead>Identificador</TableHead>
                                            <TableHead>Fecha de Envío</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submittedForms.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.form.nombre}</TableCell>
                                                <TableCell>{item.form.identificador}</TableCell>
                                                <TableCell>
                                                    {format(new Date(item.created_at), "PPP p", { locale: es })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {/* Puedes añadir una ruta para ver los detalles de la respuesta */}
                                                     <Button asChild variant="outline" size="sm">
                                                        <Link href={route('formularios.mis-respuestas-show', item.id)}>Ver Detalles</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">Aún no has enviado ninguna respuesta.</p>
                            )}

                            {/* Paginación */}
                            {submittedForms.links.length > 3 && ( // Muestra paginación solo si hay más de 3 enlaces (prev, 1, next)
                                <div className="flex justify-center mt-6">
                                    <nav className="flex items-center space-x-2">
                                        {submittedForms.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                asChild
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                            >
                                                {/* Usamos dangerouslySetInnerHTML para renderizar etiquetas HTML como &laquo; */}
                                                <Link href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default MyResponses;
