import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function RoleCreate({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('roles.store'));
    };

    return (
        <AppLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Crear Rol</h2>}
        >
            <Head title="Crear Rol" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className=" overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6  border-b border-gray-200">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label htmlFor="title" className="block text-sm font-medium">Título del Rol</label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={data.title}
                                        className="mt-1 block w-full rounded-md border-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        autoComplete="title"
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <Link href={route('roles.index')} className="text-white hover:text-gray-600 mr-4">
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        disabled={processing}
                                    >
                                        Crear Rol
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
