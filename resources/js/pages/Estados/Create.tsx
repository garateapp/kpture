import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function EstadoCreate({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('estados.store'));
    };

    return (
        <AppLayout>
            <Head title="Crear Estado" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label htmlFor="nombre" className="block text-sm font-medium">Nombre del Estado</label>
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
                                    <Link href={route('estados.index')} className=" hover:text-gray-900 mr-4">
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        disabled={processing}
                                    >
                                        Crear Estado
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
