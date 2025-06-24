<?php

namespace App\Http\Controllers;

use App\Models\TipoFormulario;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class TipoFormularioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tiposformularios = TipoFormulario::paginate(10); // Paginate the results

        return Inertia::render('TipoFormulario/Index', [
            'tiposformularios' => $tiposformularios,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('TipoFormulario/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255', 'unique:TipoFormulario,nombre'],
        ]);

        TipoFormulario::create([
            'nombre' => $request->nombre,
        ]);

        return redirect()->route('tipoformulario.index')->with('success', 'Tipo Formulario creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TipoFormulario $TipoFormulario)
    {
        return Inertia::render('TipoFormulario/Show', [ // Optional, you might not need a 'Show' page
            'TipoFormulario' => $TipoFormulario,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TipoFormulario $tipoformulario)
    {
        return Inertia::render('TipoFormulario/Edit', [
            'tipoformulario' => $tipoformulario,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TipoFormulario $TipoFormulario)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('TipoFormulario')->ignore($TipoFormulario->id)],
        ]);

        $TipoFormulario->update([
            'nombre' => $request->nombre,
        ]);

        return redirect()->route('TipoFormulario.index')->with('success', 'Tipo Formulario actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TipoFormulario $TipoFormulario)
    {
        $TipoFormulario->delete();
        return redirect()->route('TipoFormulario.index')->with('success', 'Tipo Formulario eliminado exitosamente.');
    }
}
