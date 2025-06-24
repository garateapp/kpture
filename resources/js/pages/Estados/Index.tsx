import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function EstadoIndex({ auth, estados }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEstados = estados.data.filter(estado =>
        estado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Estados" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            {flash.success && (
                                <div className="mb-4 font-medium text-sm text-green-600">
                                    {flash.success}
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <Link
                                    href={route('estados.create')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Crear Estado
                                </Link>
                                <input
                                    type="text"
                                    placeholder="Buscar estado..."
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
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredEstados.length > 0 ? (
                                            filteredEstados.map((estado) => (
                                                <tr key={estado.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{estado.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{estado.nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('estados.edit', estado.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</Link>
                                                        <Link
                                                            href={route('estados.destroy', estado.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="text-red-600 hover:text-red-900"
                                                            onClick={() => confirm('¿Estás seguro de que quieres eliminar este estado? Esto podría afectar a los usuarios asociados.')}
                                                        >
                                                            Eliminar
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-4 text-center text-sm ">No se encontraron estados.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-700">
                                    Mostrando {estados.from} a {estados.to} de {estados.total} resultados
                                </span>
                                <div className="flex space-x-2">
                                    {estados.links.map((link, index) => (
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
                </div>
            </div>
        </AppLayout>
    );
}
