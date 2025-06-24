<?php

namespace App\Http\Controllers;

use App\Models\Grupo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class GrupoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $grupos = Grupo::paginate(10); // Paginate the results

        return Inertia::render('Grupos/Index', [
            'grupos' => $grupos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Grupos/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255', 'unique:grupos,nombre'],
        ]);

        Grupo::create([
            'nombre' => $request->nombre,
        ]);

        return redirect()->route('grupos.index')->with('success', 'Grupo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Grupo $grupo)
    {
        return Inertia::render('Grupos/Show', [ // Optional, you might not need a 'Show' page
            'grupo' => $grupo,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Grupo $grupo)
    {
        return Inertia::render('Grupos/Edit', [
            'grupo' => $grupo,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Grupo $grupo)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('grupos')->ignore($grupo->id)],
        ]);

        $grupo->update([
            'nombre' => $request->nombre,
        ]);

        return redirect()->route('grupos.index')->with('success', 'Grupo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Grupo $grupo)
    {
        $grupo->delete();
        return redirect()->route('grupos.index')->with('success', 'Grupo eliminado exitosamente.');
    }
}
