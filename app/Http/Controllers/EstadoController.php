<?php

namespace App\Http\Controllers;

use App\Models\Estado;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class EstadoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $estados = Estado::paginate(10);

        return Inertia::render('Estados/Index', [
            'estados' => $estados,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Estados/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255', 'unique:estados,nombre'],
        ]);

        Estado::create([
            'nombre' => $request->nombre,
        ]);

        return redirect()->route('estados.index')->with('success', 'Estado creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Estado $estado)
    {
        return Inertia::render('Estados/Show', [
            'estado' => $estado,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Estado $estado)
    {
        return Inertia::render('Estados/Edit', [
            'estado' => $estado,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Estado $estado)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('estados')->ignore($estado->id)],
        ]);

        $estado->update([
            'nombre' => $request->nombre,
        ]);

        return redirect()->route('estados.index')->with('success', 'Estado actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Estado $estado)
    {
        // Antes de eliminar un estado, considera si hay usuarios asociados a él.
        // Podrías reasignar usuarios a otro estado por defecto o desvincularlos.
        // Aquí simplemente eliminamos el estado. La columna `estado_id` en `users` se establece a `null`
        // debido a `onDelete('set null')` en la migración.
        $estado->delete();
        return redirect()->route('estados.index')->with('success', 'Estado eliminado exitosamente.');
    }
}
