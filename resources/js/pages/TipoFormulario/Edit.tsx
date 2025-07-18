import React, { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Head, useForm, Link } from '@inertiajs/react';

// Definición de tipos para Grupo
interface TipoFormularioData {
    id: number;
    nombre: string;
    created_at: string;
    updated_at: string;
}

interface TipoFormularioEditProps {
    tipoformulario: TipoFormularioData;
}

const breadcrumbs = (tipoformularioNombre: string) => [
    {
        title: 'Gestión de Tipo Formulario',
        href: '/tipoformulario',
    },
    {
        title: `Editar: ${tipoformularioNombre}`,
        href: '#', // No hay una ruta directa para editar por nombre en breadcrumbs
    },
];

export default function TipoFormularioEdit({ tipoformulario }: TipoFormularioEditProps) {
    console.log('Tipo Formulario:', tipoformulario);
    const { data, setData, put, processing, errors, reset } = useForm({

        nombre: tipoformulario.nombre || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('tipoformulario.update', tipoformulario.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(tipoformulario.nombre)}>
            <Head title={`Editar Tipo Formulario: ${tipoformulario.nombre}`} />
                    <HeadingSmall title={`Editar Tipo Formulario: ${tipoformulario.nombre}`} description="Actualiza la información de este tipo." />
                    <div className=" overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6  border-b border-gray-200">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label htmlFor="nombre" className="block text-sm font-medium">Nombre del Tipo de Formulario</label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        name="nombre"
                                        value={data.nombre}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        autoComplete="nombre"
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        required
                                    />
                                    {errors.nombre && <div className="text-red-500 text-sm mt-1">{errors.nombre}</div>}
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <Link href={route('tipoformulario.index')} className=" hover:text-gray-900 mr-4">
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        disabled={processing}
                                    >
                                        Actualizar Tipo Formulario
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>


        </AppLayout>
    );
}
