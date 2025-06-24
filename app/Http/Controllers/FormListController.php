<?php

namespace App\Http\Controllers;

use App\Models\FormList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormListController extends Controller
{
    /**
     * Obtener todas las entidades únicas disponibles.
     */
    public function getEntities()
    {
        $entities = FormList::select('entidad')->distinct()->orderBy('entidad')->pluck('entidad');
        return response()->json($entities);
    }

    /**
     * Obtener los valores (código, valor) para una entidad específica.
     */
    public function getValuesByEntity(Request $request)
    {
        // $request->validate([
        //     'entidad' => 'required|string',
        // ]);

        $values = FormList::where('entidad', $request->entidad)
                          ->select('codigo as value', 'valor as label') // Renombrar para que coincida con el formato de opciones
                          ->orderBy('valor')
                          ->get();

        return response()->json($values);
    }
     public function index()
    {
        $formLists = FormList::paginate(10); // O el número de elementos por página que prefieras

        return Inertia::render('FormLists/Index', [
            'formLists' => $formLists,
            'flash' => session('flash'), // Pasar mensajes flash
        ]);
    }

    public function create()
    {
        return Inertia::render('FormLists/Create');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'entidad' => ['required', 'string', 'max:255'],
            'codigo' => ['required', 'string', 'max:255'],
            'valor' => ['required', 'string', 'max:255'],
        ]);

        FormList::create($validatedData);

        return redirect()->route('form-lists.index')
                         ->with('flash', ['success' => 'Lista de formulario creada exitosamente.']);
    }

    public function edit(FormList $formList)
    {
        return Inertia::render('FormLists/Edit', [
            'formList' => $formList,
        ]);
    }

    public function update(Request $request, FormList $formList)
    {
        $validatedData = $request->validate([
            'entidad' => ['required', 'string', 'max:255'],
            'codigo' => ['required', 'string', 'max:255'],
            'valor' => ['required', 'string', 'max:255'],
        ]);

        $formList->update($validatedData);

        return redirect()->route('form-lists.index')
                         ->with('flash', ['success' => 'Lista de formulario actualizada exitosamente.']);
    }

    public function destroy(FormList $formList)
    {
        $formList->delete();

        return redirect()->route('form-lists.index')
                         ->with('flash', ['success' => 'Lista de formulario eliminada exitosamente.']);
    }
    /**
     * Remove the specified resource from storage.
     */
    // public function destroy(FormList $formList)
    // {
    //     try {
    //         $formList->delete();

    //         return response()->json(null, 204); // 204 No Content
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'An error occurred while deleting the list item.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }
}
