import React from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Head, useForm, Link } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Gestión de Tipo Formulario',
        href: '/tipoformulario',
    },
    {
        title: 'Crear Tipo Formulario',
        href: '/tipoformulario/create',
    },
];

export default function TipoFormularioCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tipoformulario.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Tipo Formulario" />


                    <HeadingSmall title="Crear Tipo Formulario" description="Crea un nuevo Tipo de Formulario." />

                    <div className=" overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6  border-b border-gray-200">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label htmlFor="nombre" className="block text-sm font-medium ">Nombre del Tipo</label>
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
                                    <Link href={route('tipoformulario.index')} className="hover:text-gray-900 mr-4">
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        disabled={processing}
                                    >
                                        Crear Tipo Formulario
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

        </AppLayout>
    );
}
