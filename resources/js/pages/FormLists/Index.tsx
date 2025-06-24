// resources/js/Pages/FormLists/Index.tsx

import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
// import SettingsLayout from '@/layouts/settings/layout'; // Puedes descomentar si lo usas
import HeadingSmall from '@/components/heading-small'; // Si usas este componente

// Definición de tipos para FormList y datos paginados
interface FormListData {
    id: number;
    entidad: string;
    codigo: string;
    valor: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null; // Opcional, si manejas soft deletes
}

interface PaginatedData<T> {
    data: T[];
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface FormListIndexProps {
    formLists: PaginatedData<FormListData>;
    // Puedes añadir otros props que necesites desde el controlador de Laravel
}

const breadcrumbs = [
    {
        title: 'Gestión de Listas de Formulario',
        href: '/form-lists', // Ajusta la URL base si es diferente
    },
];

export default function FormListIndex({ formLists }: FormListIndexProps) {
    //const { flash } = usePage().props as { flash: { success?: string; error?: string } };
     const { flash } = usePage().props as PageProps;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFormLists = formLists.data.filter(formList =>
        formList.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formList.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formList.valor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Listas de Formulario" />

            {/* <HeadingSmall title="Gestión de Listas de Formulario" description="Administra las listas de selección y valores de tu aplicación." /> */}

            <div className="overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 border-b border-gray-200">
                   {/* Usa el encadenamiento opcional (?.) aquí */}
                    {flash?.success && (
                        <div className="mb-4 font-medium text-sm text-green-600">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 font-medium text-sm text-red-600">
                            {flash.error}
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-4">
                        <Link
                            href={route('form-lists.create')} // Asegúrate de que esta ruta exista en Laravel (web.php)
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Crear Nueva Lista
                        </Link>
                        <input
                            type="text"
                            placeholder="Buscar por entidad, código o valor..."
                            className="border rounded px-3 py-2 w-1/3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Entidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Valor</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredFormLists.length > 0 ? (
                                    filteredFormLists.map((formList) => (
                                        <tr key={formList.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formList.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formList.entidad}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formList.codigo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formList.valor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('form-lists.edit', formList.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</Link>
                                                <Link
                                                    href={route('form-lists.destroy', formList.id)}
                                                    method="delete"
                                                    as="button"
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={() => confirm('¿Estás seguro de que quieres eliminar esta lista?')}
                                                >
                                                    Eliminar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm">No se encontraron listas de formulario.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm">
                            Mostrando {formLists.from} a {formLists.to} de {formLists.total} resultados
                        </span>
                        <div className="flex space-x-2">
                            {formLists.links.map((link, index) => (
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
