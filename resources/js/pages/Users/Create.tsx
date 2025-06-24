import React, { useState } from 'react';


// Importa tus layouts personalizados
import AppLayout from '@/layouts/app-layout';

import { Head, useForm, Link,usePage } from '@inertiajs/react';

export default function UserCreate({ auth, roles, estados,grupos }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
        estado_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    const handleRoleChange = (e) => {
        const { value, checked } = e.target;
        setData('roles', checked
            ? [...data.roles, value]
            : data.roles.filter((roleId) => roleId !== value)
        );
    };
const breadcrumbs = [
    {
        title: 'Creación de Usuario',
        href: '/users/Create', // Asegúrate de que esta ruta exista
    },
];
    return (
       <AppLayout breadcrumbs={breadcrumbs}>
                   <Head title="Crear Usuario" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium ">Nombre</label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        autoComplete="name"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium ">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        autoComplete="email"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-sm font-medium ">Contraseña</label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium ">Confirmar Contraseña</label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    {errors.password_confirmation && <div className="text-red-500 text-sm mt-1">{errors.password_confirmation}</div>}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium ">Roles</label>
                                    <div className="mt-2 space-y-2">
                                        {roles.map((role) => (
                                            <div key={role.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`role-${role.id}`}
                                                    value={role.id}
                                                    checked={data.roles.includes(String(role.id))} // Convertir a string para la comparación
                                                    onChange={handleRoleChange}

                                                />
                                                <label htmlFor={`role-${role.id}`} className="ml-2 text-sm text-gray-900">
                                                    {role.title}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.roles && <div className="text-red-500 text-sm mt-1">{errors.roles}</div>}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="estado_id" className="block text-sm font-medium ">Estado</label>
                                    <select
                                        id="estado_id"
                                        name="estado_id"
                                        value={data.estado_id}
                                        onChange={(e) => setData('estado_id', e.target.value)}

                                    >
                                        <option value="">Selecciona un estado</option>
                                        {estados.map((estado) => (
                                            <option key={estado.id} value={estado.id}>
                                                {estado.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.estado_id && <div className="text-red-500 text-sm mt-1">{errors.estado_id}</div>}
                                </div>
                                 <div className="mb-4">
                                    <label htmlFor="grupo_id" className="block text-sm font-medium ">Grupo</label>
                                    <select
                                        id="grupo_id"
                                        name="grupo_id"
                                        value={data.grupo_id}
                                        onChange={(e) => setData('grupo_id', e.target.value)}

                                    >
                                        <option value="">Selecciona un Grupo</option>
                                        {grupos.map((grupo) => (
                                            <option key={grupo.id} value={grupo.id}>
                                                {grupo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.grupo_id && <div className="text-red-500 text-sm mt-1">{errors.grupo_id}</div>}
                                </div>
                                <div className="flex items-center justify-end mt-4">
                                    <Link href={route('users.index')} className="text-gray-600 hover:text-gray-900 mr-4">
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2  rounded-md"
                                        disabled={processing}
                                    >
                                        Crear Usuario
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
