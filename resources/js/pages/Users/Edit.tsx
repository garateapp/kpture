import React, { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Head, useForm, Link } from '@inertiajs/react';


// Importa componentes de Shadcn UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Para los checkboxes de roles
import { FormControl } from '@/components/ui/form'; // Si lo usas con form-radix

// Definición de tipos
interface RoleData {
    id: number;
    title: string;
}

interface EstadoData {
    id: number;
    nombre: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    estado_id: number | null;
    roles: RoleData[]; // Los roles actualmente asignados al usuario
}

interface UserEditProps {
    user: UserData;
    estados: EstadoData[]; // Si pasas estados para un dropdown
    allRoles: RoleData[]; // Todos los roles disponibles
}

const breadcrumbs = (userName: string) => [
    {
        title: 'Gestión de Usuarios',
        href: '/users',
    },
    {
        title: `Editar: ${userName}`,
        href: '#',
    },
];

export default function UserEdit({ user, estados, allRoles }: UserEditProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        estado_id: user.estado_id,
        // Inicializa los roles seleccionados con los IDs de los roles actuales del usuario
        roles: user.roles.map(role => role.id),
    });

    useEffect(() => {
        // Resetear la contraseña al cambiar de usuario o al cargar la página si no se edita
        // Esto previene que se reenvíe una contraseña hasheada accidentalmente
        setData(currentData => ({
            ...currentData,
            password: '',
            password_confirmation: '',
        }));
    }, [user.id, setData]); // Dependencia en user.id para resetear si el usuario cambia

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };
     // Manejador para el select múltiple
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.options)
            .filter(option => option.selected)
            .map(option => parseInt(option.value));
        setData('roles', selectedOptions);
    };

    const handleRoleChange = (roleId: number, isChecked: boolean) => {
        setData('roles', prevRoles =>
            isChecked
                ? [...prevRoles, roleId]
                : prevRoles.filter(id => id !== roleId)
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(user.name)}>
            <Head title={`Editar Usuario: ${user.name}`} />


                    <HeadingSmall title={`Editar Usuario: ${user.name}`} description="Actualiza la información y los roles del usuario." />

                    <div className="p-6">
                        <form onSubmit={submit}>
                            {/* Campo Nombre */}
                            <div className="mb-4 space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="w-full"
                                    autoComplete="name"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>

                            {/* Campo Email */}
                            <div className="mb-4 space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="w-full"
                                    autoComplete="email"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                            </div>

                            {/* Campo Contraseña (Opcional) */}
                            <div className="mb-4 space-y-2">
                                <Label htmlFor="password">Contraseña (dejar en blanco para no cambiar)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                            </div>

                            {/* Campo Confirmar Contraseña (Opcional) */}
                            <div className="mb-4 space-y-2">
                                <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                {errors.password_confirmation && <div className="text-red-500 text-sm mt-1">{errors.password_confirmation}</div>}
                            </div>

                            {/* Campo Estado (si tienes el dropdown de estados) */}
                            {estados && estados.length > 0 && (
                                <div className="mb-4 space-y-2">
                                    <Label htmlFor="estado_id">Estado</Label>
                                    <Select
                                        onValueChange={(value) => setData('estado_id', parseInt(value))}
                                        value={data.estado_id?.toString() || ""}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona un estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estados.map(estado => (
                                                <SelectItem key={estado.id} value={estado.id.toString()}>
                                                    {estado.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.estado_id && <div className="text-red-500 text-sm mt-1">{errors.estado_id}</div>}
                                </div>
                            )}

                            {/* Selección de Roles */}
                            {/* Selección de Roles con SELECT MÚLTIPLE */}
                            <div className="mb-6 space-y-2">
                                <Label htmlFor="roles">Roles</Label>
                                <select
                                    id="roles"
                                    name="roles[]" // Importante para que Laravel lo reciba como array
                                    multiple // Habilita la selección múltiple
                                    className="block w-full rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    // Las clases de arriba intentan emular el estilo de Shadcn Input
                                    value={data.roles.map(String)} // `value` debe ser un array de strings para el select múltiple
                                    onChange={handleMultiSelectChange}
                                >
                                    {allRoles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.roles && <div className="text-red-500 text-sm mt-1">{errors.roles}</div>}
                                {errors['roles.0'] && <div className="text-red-500 text-sm mt-1">Error en la selección de roles.</div>}
                            </div>


                            <div className="flex items-center justify-end mt-6">
                                <Link href={route('users.index')} className="mr-4">
                                    <Button variant="outline">Cancelar</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Actualizar Usuario
                                </Button>
                            </div>
                        </form>
                    </div>

        </AppLayout>
    );
}
