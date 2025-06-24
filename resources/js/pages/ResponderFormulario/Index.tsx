// resources/js/Pages/ResponderFormulario/Index.tsx

import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Edit2Icon, PlayCircleIcon } from 'lucide-react';

// Definición de tipos para el formulario (simplificada para la lista)
interface FormularioItem {
    id: number;
    nombre: string;
    identificador: string;
    estado: { nombre: string };
    tipo_formulario: { nombre: string }; // Ajustado a tipo_formulario
    user: { name: string };
    created_at: string;
}

interface ResponderFormularioIndexProps extends PageProps {
    formularios: {
        data: FormularioItem[];
        links: any[]; // Links de paginación
        current_page: number;
        last_page: number;
    };
}

const ResponderFormularioIndex: React.FC<ResponderFormularioIndexProps> = ({ auth, formularios }) => {
    return (
        <AppLayout>
            <Head title="Responder Formulario" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Formularios Disponibles</CardTitle>
                            <CardDescription>Selecciona un formulario de la lista para comenzar a responderlo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {formularios.data.length === 0 ? (
                                <p className="text-center text-muted-foreground">No hay formularios disponibles para responder.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Identificador</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Creado Por</TableHead>
                                            <TableHead>Fecha Creación</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formularios.data.map((formulario) => (
                                            <TableRow key={formulario.id}>
                                                <TableCell className="font-medium">{formulario.nombre}</TableCell>
                                                <TableCell>{formulario.identificador}</TableCell>
                                                <TableCell>{formulario.estado?.nombre || 'N/A'}</TableCell>
                                                <TableCell>{formulario.tipo_formulario?.nombre || 'N/A'}</TableCell>
                                                <TableCell>{formulario.user?.name || 'N/A'}</TableCell>
                                                <TableCell>{new Date(formulario.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={route('formularios.responder', formulario.id)}>
                                                            <PlayCircleIcon className="mr-2 h-4 w-4" /> Responder
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {/* Aquí podrías añadir la paginación si tus formularios se paginan */}
                            {/* <div className="mt-4 flex justify-center">
                                {formularios.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        asChild
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        className="mx-1"
                                        disabled={!link.url}
                                    >
                                        <Link href={link.url || '#'}>
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    </Button>
                                ))}
                            </div> */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default ResponderFormularioIndex;
