// resources/js/Pages/FormLists/Edit.tsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input'; // Ajusta la ruta a tus componentes UI
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Reusa la interfaz de FormListData
interface FormListData {
    id: number;
    entidad: string;
    codigo: string;
    valor: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

interface FormListEditProps {
    formList: FormListData; // La lista que se va a editar
}

const breadcrumbs = (formListId: number) => [
    { title: 'Gestión de Listas de Formulario', href: '/form-lists' },
    { title: `Editar: ${formListId}`, href: `/form-lists/${formListId}/edit` }, // Ajusta la URL
];

export default function FormListEdit({ formList }: FormListEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        entidad: formList.entidad,
        codigo: formList.codigo,
        valor: formList.valor,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('form-lists.update', formList.id)); // Asegúrate de que esta ruta exista en Laravel (web.php)
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(formList.id)}>
            <Head title={`Editar Lista: ${formList.id}`} />

            <div className="overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">{`Editar Lista de Formulario: ${formList.id}`}</h2>

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
                                {processing ? 'Actualizando...' : 'Actualizar Lista'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
