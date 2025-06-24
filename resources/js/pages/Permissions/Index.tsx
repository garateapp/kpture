import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

// Importa tus layouts personalizados
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';

// Importa componentes de Shadcn UI (ajusta las rutas según tu setup)
// Suponiendo que tienes estos componentes generados por shadcn-ui
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Para los botones de acción y crear

// Definición de tipos para Permission y datos paginados
interface PermissionData {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null; // Incluye softDeletes
}

interface PaginatedData<T> {
    data: T[];
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PermissionIndexProps {
    permissions: PaginatedData<PermissionData>;
}

const breadcrumbs = [
    {
        title: 'Gestión de Permisos',
        href: '/permissions',
    },
];

export default function PermissionIndex({ permissions }: PermissionIndexProps) {
    const { flash } = usePage().props as { flash: { success?: string; error?: string } };
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPermissions = permissions.data.filter(permission =>
        permission.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Permisos" />


                    <HeadingSmall title="Gestión de Permisos" description="Administra los permisos de tu aplicación." />

                    {flash.success && (
                        <div className="mb-4 text-green-600">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-4 text-red-600">
                            {flash.error}
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                        <Link href={route('permissions.create')}>
                            <Button>Crear Permiso</Button>
                        </Link>
                        <Input
                            type="text"
                            placeholder="Buscar permiso..."
                            className="w-1/3" // Puedes ajustar el ancho con clases de Tailwind si es necesario
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Fecha de Creación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPermissions.length > 0 ? (
                                    filteredPermissions.map((permission) => (
                                        <TableRow key={permission.id} className={permission.deleted_at ? 'opacity-50 line-through' : ''}>
                                            <TableCell className="font-medium">{permission.id}</TableCell>
                                            <TableCell>{permission.title}</TableCell>
                                            <TableCell>{new Date(permission.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {permission.deleted_at ? (
                                                        <>
                                                            {/* Si tienes la ruta y el método para restaurar */}
                                                            {/* <Link href={route('permissions.restore', permission.id)} method="post" as="button">
                                                                <Button variant="outline" size="sm">Restaurar</Button>
                                                            </Link> */}
                                                            {/* Si tienes la ruta y el método para eliminar permanentemente */}
                                                            {/* <Link href={route('permissions.forceDelete', permission.id)} method="delete" as="button" onClick={() => confirm('¿Estás seguro de eliminar permanentemente este permiso?')}>
                                                                <Button variant="destructive" size="sm">Eliminar Perm.</Button>
                                                            </Link> */}
                                                            <span className="text-sm text-muted-foreground">Eliminado</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Link href={route('permissions.edit', permission.id)}>
                                                                <Button variant="outline" size="sm">Editar</Button>
                                                            </Link>
                                                            <Link
                                                                href={route('permissions.destroy', permission.id)}
                                                                method="delete"
                                                                as="button"
                                                                onClick={() => confirm('¿Estás seguro de que quieres eliminar este permiso? (Se realizará un soft-delete)')}
                                                            >
                                                                <Button variant="destructive" size="sm">Eliminar</Button>
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">No se encontraron permisos.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-muted-foreground">
                            Mostrando {permissions.from} a {permissions.to} de {permissions.total} resultados
                        </span>
                        <div className="flex space-x-2">
                            {permissions.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                >
                                    <Button
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>

        </AppLayout>
    );
}
