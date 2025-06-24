import React from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Head, useForm, Link } from '@inertiajs/react';

// Importa componentes de Shadcn UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Definición de tipos
interface PermissionData {
    id: number;
    title: string;
}

interface RoleData {
    id: number;
    title: string;
    permissions: PermissionData[]; // Permissions currently assigned to the role
}

interface RoleEditProps {
    role: RoleData;
    allPermissions: PermissionData[]; // All available permissions
}

const breadcrumbs = (roleTitle: string) => [
    {
        title: 'Gestión de Roles',
        href: '/roles',
    },
    {
        title: `Editar: ${roleTitle}`,
        href: '#',
    },
];

export default function RoleEdit({ role, allPermissions }: RoleEditProps) {
    console.log('RoleEdit component rendered with role:', role);
    console.log('All permissions:', allPermissions);
    const { data, setData, put, processing, errors, reset } = useForm({
        title: role.title || '',
        // Initialize selected permissions with the IDs of the role's current permissions
        permissions: role.permissions.map(permission => permission.id),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    // Handler for the native multi-select
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.options)
            .filter(option => option.selected)
            .map(option => parseInt(option.value));
        setData('permissions', selectedOptions);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(role.title)}>
            <Head title={`Editar Rol: ${role.title}`} />


                    <HeadingSmall title={`Editar Rol: ${role.title}`} description="Actualiza la información y los permisos del rol." />

                    <div className="p-6">
                        <form onSubmit={submit}>
                            {/* Campo Título del Rol */}
                            <div className="mb-4 space-y-2">
                                <Label htmlFor="title">Título del Rol</Label>
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

                            {/* Selección de Permisos con SELECT MÚLTIPLE */}
                            <div className="mb-6 space-y-2">
                                <Label htmlFor="permissions">Permisos</Label>
                                <select
                                    id="permissions"
                                    name="permissions[]" // Important for Laravel to receive as an array
                                    multiple // Enable multiple selection
                                    className="block w-full rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    // These classes attempt to emulate Shadcn Input styling
                                    value={data.permissions.map(String)} // `value` must be an array of strings for multi-select
                                    onChange={handleMultiSelectChange}
                                >
                                    {allPermissions.map(permission => (
                                        <option key={permission.id} value={permission.id}>
                                            {permission.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.permissions && <div className="text-red-500 text-sm mt-1">{errors.permissions}</div>}
                                {errors['permissions.0'] && <div className="text-red-500 text-sm mt-1">Error en la selección de permisos.</div>}
                            </div>

                            <div className="flex items-center justify-end mt-6">
                                <Link href={route('roles.index')} className="mr-4">
                                    <Button variant="outline">Cancelar</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Actualizar Rol
                                </Button>
                            </div>
                        </form>
                    </div>

        </AppLayout>
    );
}
