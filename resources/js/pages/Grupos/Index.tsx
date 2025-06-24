import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';

// Definición de tipos para Grupo y datos paginados
interface GrupoData {
    id: number;
    nombre: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedData<T> {
    data: T[];
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface GrupoIndexProps {
    grupos: PaginatedData<GrupoData>;
}

const breadcrumbs = [
    {
        title: 'Gestión de Grupos',
        href: '/grupos',
    },
];

export default function GrupoIndex({ grupos }: GrupoIndexProps) {
    const { flash } = usePage().props as { flash: { success?: string; error?: string } };
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGrupos = grupos.data.filter(grupo =>
        grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Grupos" />


                    {/*<HeadingSmall title="Gestión de Grupos" description="Administra los grupos de tu aplicación." /> */}

                    <div className=" overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6  border-b border-gray-200">
                            {flash.success && (
                                <div className="mb-4 font-medium text-sm text-green-600">
                                    {flash.success}
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <Link
                                    href={route('grupos.create')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Crear Grupo
                                </Link>
                                <input
                                    type="text"
                                    placeholder="Buscar grupo..."
                                    className="border rounded px-3 py-2 w-1/3"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium  uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className=" divide-y divide-gray-200">
                                        {filteredGrupos.length > 0 ? (
                                            filteredGrupos.map((grupo) => (
                                                <tr key={grupo.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{grupo.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{grupo.nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('grupos.edit', grupo.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</Link>
                                                        <Link
                                                            href={route('grupos.destroy', grupo.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="text-red-600 hover:text-red-900"
                                                            onClick={() => confirm('¿Estás seguro de que quieres eliminar este grupo?')}
                                                        >
                                                            Eliminar
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-center text-sm ">No se encontraron grupos.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm">
                                    Mostrando {grupos.from} a {grupos.to} de {grupos.total} resultados
                                </span>
                                <div className="flex space-x-2">
                                    {grupos.links.map((link, index) => (
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
