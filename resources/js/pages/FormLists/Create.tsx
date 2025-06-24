// resources/js/Pages/FormLists/Create.tsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input'; // Ajusta la ruta a tus componentes UI
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormListCreateProps {
    // No se necesitan props iniciales para la creación, a menos que quieras pasar algo
    // como opciones predeterminadas o listas para desplegables.
}

const breadcrumbs = [
    { title: 'Gestión de Listas de Formulario', href: '/form-lists' },
    { title: 'Crear', href: '/form-lists/create' },
];

export default function FormListCreate({}: FormListCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        entidad: '',
        codigo: '',
        valor: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('form-lists.store')); // Asegúrate de que esta ruta exista en Laravel (web.php)
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Lista de Formulario" />

            <div className="overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Crear Nueva Lista de Formulario</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="entidad">Entidad</Label>
                            <Input
                                id="entidad"
                                type="text"
                                value={data.entidad}
                                onChange={(e) => setData('entidad', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors.entidad && <Alert variant="destructive" className="mt-2"><AlertDescription>{errors.entidad}</AlertDescription></Alert>}
                        </div>

                        <div>
                            <Label htmlFor="codigo">Código</Label>
                            <Input
                                id="codigo"
                                type="text"
                                value={data.codigo}
                                onChange={(e) => setData('codigo', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors.codigo && <Alert variant="destructive" className="mt-2"><AlertDescription>{errors.codigo}</AlertDescription></Alert>}
                        </div>

                        <div>
                            <Label htmlFor="valor">Valor</Label>
                            <Input
                                id="valor"
                                type="text"
                                value={data.valor}
                                onChange={(e) => setData('valor', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors.valor && <Alert variant="destructive" className="mt-2"><AlertDescription>{errors.valor}</AlertDescription></Alert>}
                        </div>

                        <div className="flex items-center justify-end mt-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Lista'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
