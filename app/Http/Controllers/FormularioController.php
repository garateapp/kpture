<?php

namespace App\Http\Controllers;

use App\Models\Formulario;
use App\Models\Estado; // Para el campo estado_id
use App\Models\TipoFormulario; // Necesitarás este modelo si no lo tienes
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str; // Para generar el identificador
use App\Models\Grupo; // Si tienes un modelo Grupo para el campo grupo_id
class FormularioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Carga la relación 'user' y 'estado' para mostrar en la tabla
        $formularios = Formulario::with(['user:id,name', 'estado:id,nombre', 'tipoFormulario:id,nombre', 'grupo:id,nombre']) // Asegúrate de que el campo 'nombre' exista en el modelo Grupo
                                 ->paginate(10);

        return Inertia::render('Formularios/Index', [
            'formularios' => $formularios,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $estados = Estado::select('id', 'nombre')->get();
        $tiposFormulario = TipoFormulario::select('id', 'nombre')->get(); // Asume que tienes un campo 'nombre' en TipoFormulario
        $grupos = Grupo::select('id', 'nombre')->get(); // Asegúrate de que el modelo Grupo exista y tenga un campo 'nombre'
        return Inertia::render('Formularios/Create', [
            'estados' => $estados,
            'tiposFormulario' => $tiposFormulario,
            'grupos' => $grupos, // Asegúrate de pasar el grupo si es necesario
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'tipoformulario_id' => ['required', 'exists:tipoformulario,id'], // Ajusta el nombre de la tabla si es diferente
            'permite_edicion' => ['boolean'],
            'identificador' => ['nullable', 'string', 'max:255', 'unique:formulario,identificador'],
            'form_estructura_json' => ['nullable', 'json'], // Validar como JSON string
            'estado_id' => ['required', 'exists:estados,id'],
            'grupo_id' => ['nullable', 'exists:grupos,id'], // Si tienes un campo grupo_id, asegúrate de que esté en la migración
            'generate_pdf' => ['boolean'],
            'send_pdf_email' => ['boolean'],
            'email_recipients' => ['nullable', 'array'],
            'email_recipients.*' => ['email'],
            'email_subject' => ['nullable', 'string', 'max:500'],
            'email_body' => ['nullable', 'string'],
        ]);

        // Generar un identificador si no se proporciona
        $identificador = $request->identificador ?? Str::slug($request->nombre) . '-' . Str::random(6);

        Formulario::create([
            'user_id' => $request->user()->id, // Asigna el usuario autenticado como creador
            'nombre' => $request->nombre,
            'tipoformulario_id' => $request->tipoformulario_id,
            'permite_edicion' => $request->boolean('permite_edicion'),
            'identificador' => $identificador,
            'form_estructura_json' => $request->form_estructura_json, // Se guardará como JSON string, se casteará a array por el modelo
            'estado_id' => $request->estado_id,
            'grupo_id' => $request->grupo_id, // Si tienes un campo grupo_id, asegúrate de que esté en la migración
            'generate_pdf' => $request->boolean('generate_pdf'),
            'send_pdf_email' => $request->boolean('send_pdf_email'),
            'email_recipients' => $request->email_recipients,
            'email_subject' => $request->email_subject,
            'email_body' => $request->email_body,
        ]);

        return redirect()->route('formularios.index')->with('success', 'Formulario creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Formulario $formulario)
    {
        // Opcional: si necesitas una página de visualización detallada
        $formulario->load(['user:id,name', 'estado:id,nombre', 'tipoFormulario:id,nombre', 'grupo:id,nombre']); // Asegúrate de que el campo 'nombre' exista en el modelo Grupo
        return Inertia::render('Formularios/Show', [
            'formulario' => $formulario,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Formulario $formulario)
    {
        // Carga las relaciones para mostrar en la vista de edición
        $formulario->load(['user:id,name', 'estado:id,nombre', 'tipoFormulario:id,nombre', 'grupo:id,nombre']); // Asegúrate de que el campo 'nombre' exista en el modelo Grupo
        $estados = Estado::select('id', 'nombre')->get();
        $grupos= Grupo::select('id', 'nombre')->get(); // Asegúrate de que el modelo Grupo exista y tenga un campo 'nombre'
        $tiposFormulario = TipoFormulario::select('id', 'nombre')->get();

        return Inertia::render('Formularios/Edit', [
            'formulario' => $formulario,
            'estados' => $estados,
            'tiposFormulario' => $tiposFormulario,
            'grupos' => $grupos, // Asegúrate de pasar el grupo si es necesario
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
   public function update(Request $request, Formulario $formulario)
    {

        // Validación completa para actualizaciones manuales
        $request->validate([
            'nombre' => ['nullable', 'string', 'max:255'],
            'tipoformulario_id' => ['nullable', 'exists:tipoformulario,id'],
            'permite_edicion' => ['nullable', 'boolean'],
            'identificador' => ['nullable', 'string', 'max:255', Rule::unique('formulario', 'identificador')->ignore($formulario->id)],
            'form_estructura_json' => ['nullable', 'string', 'json'],
            'estado_id' => ['nullable', 'exists:estados,id'],
            'grupo_id' => ['nullable', 'exists:grupos,id'],
            'generate_pdf' => ['nullable', 'boolean'],
            'send_pdf_email' => ['nullable', 'boolean'],
            'email_recipients' => ['nullable', 'array'],
            'email_subject' => ['nullable', 'string', 'max:500'],
            'email_body' => ['nullable', 'string'],
        ]);
 // Para depurar, puedes eliminarlo después
        // Actualizar solo los campos que se enviaron
        $updateData = array_filter([
            'nombre' => $request->input('nombre'),
            'tipoformulario_id' => $request->input('tipoformulario_id'),
            'permite_edicion' => $request->has('permite_edicion') ? $request->boolean('permite_edicion') : null,
            'identificador' => $request->input('identificador'),
            'form_estructura_json' => $request->input('form_estructura_json'),
            'estado_id' => $request->input('estado_id'),
            'grupo_id' => $request->input('grupo_id'),
            'generate_pdf' => $request->has('generate_pdf') ? $request->boolean('generate_pdf') : null,
            'send_pdf_email' => $request->has('send_pdf_email') ? $request->boolean('send_pdf_email') : null,
            'email_recipients' => $request->input('email_recipients'), // Asegúrate de que sea un array o null
            'email_subject' => $request->input('email_subject'),
            'email_body' => $request->input('email_body'),
        ], function ($value) {
            return $value !== null;
        });
        // Para depurar, puedes eliminarlo después
        $formulario->update($updateData); // Actualiza el formulario con los datos proporcionados

        // Es crucial retornar una respuesta Inertia para que preserveState/preserveScroll funcionen
        return Inertia::render('Formularios/Edit', [
            'formulario' => $formulario->fresh(), // Obtener el formulario actualizado de la base de datos
            'estados' => \App\Models\Estado::all(), // Asegúrate de pasar todas las props necesarias
            'tiposFormulario' => \App\Models\TipoFormulario::all(),
            'grupos' => \App\Models\Grupo::all(), // Si tienes un modelo Grupo
        ])->withViewData([
            'toast' => [
                'title' => 'Guardado automático',
                'description' => 'La estructura del formulario ha sido guardada automáticamente.',
                'variant' => 'success', // Si tienes variants personalizados para toasts
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Formulario $formulario)
    {
        $formulario->delete(); // Esto realiza un soft delete
        return redirect()->route('formularios.index')->with('success', 'Formulario eliminado (soft-deleted) exitosamente.');
    }



    /**
     * Método para seleccionar un formulario para responder.
     */
     public function selectFormularioToRespond()
    {

        // Puedes ajustar la paginación o filtros según lo necesites
        $formularios = Formulario::with(['user:id,name', 'estado:id,nombre', 'tipoFormulario:id,nombre', 'grupo:id,nombre'])
                                 ->paginate(10); // O puedes usar ->get() si la lista no es muy larga

        return Inertia::render('ResponderFormulario/Index', [
            'formularios' => $formularios,
        ]);
    }

    /**
     * Show the specified form for responding.
     * Muestra el formulario específico para que el usuario lo rellene.
     */
    public function showFormularioToRespond(Formulario $formulario)
    {
        // Asegurarse de cargar la estructura JSON
        $formulario->load(['user', 'estado', 'tipoFormulario', 'grupo']);
        // Para depurar, puedes eliminarlo después
        // Aquí la estructura JSON ya vendrá casteada como array por el modelo
        return Inertia::render('ResponderFormulario/Show', [
            'formulario' => $formulario,
        ]);
    }
}
