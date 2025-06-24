import React from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Head, useForm, Link } from '@inertiajs/react';

// Importa componentes de Shadcn UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Si usas el componente Label de Shadcn

const breadcrumbs = [
    {
        title: 'Gestión de Permisos',
        href: '/permissions',
    },
    {
        title: 'Crear Permiso',
        href: '/permissions/create',
    },
];

export default function PermissionCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('permissions.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Permiso" />



                    <HeadingSmall title="Crear Permiso" description="Define un nuevo permiso para tu aplicación." />

                    <div className="p-6"> {/* Elimina las clases bg-white, border-b, border-gray-200, shadow-sm, sm:rounded-lg */}
                        <form onSubmit={submit}>
                            <div className="mb-4 space-y-2"> {/* Agrega espacio vertical */}
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

                            <div className="flex items-center justify-end mt-6"> {/* Ajusta el margen superior */}
                                <Link href={route('permissions.index')} className="mr-4">
                                    <Button variant="outline">Cancelar</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Crear Permiso
                                </Button>
                            </div>
                        </form>
                    </div>

        </AppLayout>
    );
}
