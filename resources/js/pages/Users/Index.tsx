import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

// Importa tus layouts personalizados
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout'; // Si quieres que los mantenedores estén dentro de SettingsLayout
import HeadingSmall from '@/components/heading-small'; // Si usas este componente para los títulos

// Asegúrate de tener estas interfaces definidas en un archivo como '@/types/index.d.ts'
// Si no las tienes, puedes omitirlas por ahora o definirlas en el mismo archivo para simplificar.
interface UserData {
    id: number;
    name: string;
    email: string;
    roles: { id: number; title: string }[];
    estado: { id: number; nombre: string } | null;
}

interface PaginatedData<T> {
    data: T[];
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface UserIndexProps {
    users: PaginatedData<UserData>;
    // Si la información del usuario autenticado no la pasas explícitamente y solo viene de usePage().props.auth
    // no necesitas definirla aquí a menos que quieras tipar `auth` en usePage().props.
}

// Define los breadcrumbs específicos para este mantenedor
const breadcrumbs = [
    {
        title: 'Gestión de Usuarios',
        href: '/users', // Asegúrate de que esta ruta exista
    },
];

export default function UserIndex({ users }: UserIndexProps) {
    // Accede a la información del usuario autenticado y flash messages a través de usePage().props
    const { auth, flash } = usePage().props as { auth: { user: { id: number; name: string; email: string } }; flash: { success?: string; error?: string } };
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.data.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Usuarios" />

            {/* Puedes envolverlo en SettingsLayout si quieres que tenga esa misma estructura */}


                    <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                        <div className="p-6 border-b border-gray-200">
                            {flash.success && (
                                <div className="mb-4 font-medium text-sm text-green-600">
                                    {flash.success}
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <Link
                                    href={route('users.create')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Crear Usuario
                                </Link>
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    className="border rounded px-3 py-2 w-1/3"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Roles</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Grupo</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium  uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{user.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{user.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{user.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                                        {user.roles && user.roles.length > 0
                                                            ? user.roles.map(role => role.title).join(', ')
                                                            : 'Ninguno'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                                        {user.estado ? user.estado.nombre : 'Sin estado'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                                        {user.grupo ? user.grupo.nombre : 'Sin grupo'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('users.edit', user.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</Link>
                                                        <Link
                                                            href={route('users.destroy', user.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="text-red-600 hover:text-red-900"
                                                            onClick={() => confirm('¿Estás seguro de que quieres eliminar este usuario?')}
                                                        >
                                                            Eliminar
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-sm ">No se encontraron usuarios.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm">
                                    Mostrando {users.from} a {users.to} de {users.total} resultados
                                </span>
                                <div className="flex space-x-2">
                                    {users.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm rounded ${link.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

        </AppLayout>
    );
}
