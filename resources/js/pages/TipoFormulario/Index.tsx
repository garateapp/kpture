import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';

// Definición de tipos para Grupo y datos paginados
interface TipoFormularioData {
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

interface TipoFormularioIndexProps {
    tiposformularios: PaginatedData<TipoFormularioData>;
}

const breadcrumbs = [
    {
        title: 'Gestión de Tipos de Formulario',
        href: '/tipoformulario',
    },
];

export default function TipoFormularioIndex({ tiposformularios }: TipoFormularioIndexProps) {
    const { flash } = usePage().props as { flash: { success?: string; error?: string } };
    const [searchTerm, setSearchTerm] = useState('');
    console.log('Tipo Formularios:', tiposformularios);
    const filteredTipoFormularios = tiposformularios.data.filter(tiposformulario =>
        tiposformulario.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Tipos de Formulario" description="Indica si un formulario es de tipo público o privado" />


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
                                    href={route('tipoformulario.create')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Crear Tipo Formulario
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
                                        {filteredTipoFormularios.length > 0 ? (
                                            filteredTipoFormularios.map((tiposformulario) => (
                                                <tr key={tiposformulario.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{tiposformulario.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{tiposformulario.nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('tipoformulario.edit', tiposformulario.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</Link>
                                                        <Link
                                                            href={route('tipoformulario.destroy', tiposformulario.id)}
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
                                                <td colSpan={3} className="px-6 py-4 text-center text-sm ">No se encontraron TIpos de Formulario.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm">
                                    Mostrando {tiposformularios.from} a {tiposformularios.to} de {tiposformularios.total} resultados
                                </span>
                                <div className="flex space-x-2">
                                    {tiposformularios.links.map((link, index) => (
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
