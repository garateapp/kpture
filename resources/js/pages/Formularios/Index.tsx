import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Importa tus layouts personalizados
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';

// Importa componentes de Shadcn UI
import { Badge } from '@/components/ui/badge'; // Para mostrar estados o tipos de forma visual
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrashIcon } from 'lucide-react'; // Icono de basura para eliminar formularios

// Definición de tipos para Formulario y datos paginados
interface UserData {
    id: number;
    name: string;
}

interface EstadoData {
    id: number;
    nombre: string;
}
interface GrupoData {
    id: number;
    nombre: string;
}
interface TipoFormularioData {
    id: number;
    nombre: string;
}

interface FormularioData {
    id: number;
    user_id: number;
    user: UserData; // Relación cargada
    nombre: string;
    tipoformulario_id: number;
    tipo_formulario: TipoFormularioData; // Relación cargada
    permite_edicion: boolean;
    identificador: string;
    form_estructura_json: string | null; // Aunque lo casteamos a array en backend, aquí llega como string de JSON
    estado_id: number;
    grupo_id: number;
    estado: EstadoData; // Relación cargada
    grupo: GrupoData; // Relación cargada
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface PaginatedData<T> {
    data: T[];
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface FormularioIndexProps {
    formularios: PaginatedData<FormularioData>;
}

const breadcrumbs = [
    {
        title: 'Gestión de Formularios',
        href: '/formularios',
    },
];

export default function FormularioIndex({ formularios }: FormularioIndexProps) {
    const { flash } = usePage().props as { flash: { success?: string; error?: string } };
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFormularios = formularios.data.filter(
        (formulario) =>
            formulario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formulario.identificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formulario.user?.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Formularios" />

            <HeadingSmall title="Gestión de Formularios" description="Administra la estructura de tus formularios dinámicos." />

            {flash.success && <div className="mb-4 text-green-600">{flash.success}</div>}
            {flash.error && <div className="mb-4 text-red-600">{flash.error}</div>}

            <div className="mb-4 flex items-center justify-between space-y-6">
                <Link href={route('formularios.create')}>
                    <Button>Crear Formulario</Button>
                </Link>
                <Input
                    type="text"
                    placeholder="Buscar formulario..."
                    className="w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Identificador</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Creado Por</TableHead>
                            <TableHead>Grupo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Edición Permitida</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredFormularios.length > 0 ? (
                            filteredFormularios.map((formulario) => (
                                <TableRow key={formulario.id} className={formulario.deleted_at ? 'line-through opacity-50' : ''}>
                                    <TableCell className="font-medium">{formulario.id}</TableCell>
                                    <TableCell>{formulario.nombre}</TableCell>
                                    <TableCell>{formulario.identificador}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{formulario.tipo_formulario.nombre}</Badge>
                                    </TableCell>
                                    <TableCell>{formulario.user?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{formulario.grupo.nombre}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{formulario.estado.nombre}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={formulario.permite_edicion ? 'default' : 'secondary'}>
                                            {formulario.permite_edicion ? 'Sí' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {formulario.deleted_at ? (
                                                <span className="text-muted-foreground text-sm">Eliminado</span>
                                            ) : (
                                                <>
                                                    <Link href={route('formularios.edit', formulario.id)}>
                                                        <Button variant="outline" size="sm">
                                                            Editar
                                                        </Button>
                                                    </Link>
                                                    {/* Aquí podrías tener un botón para "Diseñar" el formulario que nos llevaría a una interfaz de constructor */}
                                                    {/* <Link href={route('formularios.designer', formulario.id)}>
                                                                <Button variant="default" size="sm">Diseñar</Button>
                                                            </Link> */}
                                                    <Button asChild variant="destructive" size="sm">
                                                    <Link
                                                        href={route('formularios.destroy', formulario.id)}
                                                        method="delete"
                                                        className="focus-visible:ring-ring bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" // Clases de Shadcn para un botón destructive
                                                        onClick={(e) => {
                                                            if (!confirm('¿Estás seguro de que quieres eliminar este formulario?')) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    >

                                                        <TrashIcon className="h-4 w-4" />
                                                        <span className="sr-only">Eliminar</span>
                                                    </Link>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-muted-foreground text-center">
                                    No se encontraron formularios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="mt-4 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                    Mostrando {formularios.from} a {formularios.to} de {formularios.total} resultados
                </span>
                <div className="flex space-x-2">
                    {formularios.links.map((link, index) => (
                        <Link key={index} href={link.url || '#'}>
                            <Button
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
