import React from 'react';
import AppLayout from '@/layouts/app-layout';

import HeadingSmall from '@/components/heading-small';
import { Head, useForm, Link } from '@inertiajs/react';

// Importa componentes de Shadcn UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Definición de tipos para Permission
interface PermissionData {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface PermissionEditProps {
    permission: PermissionData;
}

const breadcrumbs = (permissionTitle: string) => [
    {
        title: 'Gestión de Permisos',
        href: '/permissions',
    },
    {
        title: `Editar: ${permissionTitle}`,
        href: '#', // No hay una ruta directa para editar por nombre en breadcrumbs
    },
];

export default function PermissionEdit({ permission }: PermissionEditProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: permission.title || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('permissions.update', permission.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(permission.title)}>
            <Head title={`Editar Permiso: ${permission.title}`} />


                    <HeadingSmall title={`Editar Permiso: ${permission.title}`} description="Actualiza la información de este permiso." />

                    <div className="p-6"> {/* Elimina las clases de fondo/bordes de Tailwind */}
                        <form onSubmit={submit}>
                            <div className="mb-4 space-y-2">
                                <Label htmlFor="title">Título del Permiso</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    className="w-full"
                                    autoComplete="title"
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>

                            <div className="flex items-center justify-end mt-6">
                                <Link href={route('permissions.index')} className="mr-4">
                                    <Button variant="outline">Cancelar</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Actualizar Permiso
                                </Button>
                            </div>
                        </form>
                    </div>

        </AppLayout>
    );
}
