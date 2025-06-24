<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permissions = Permission::paginate(10); // Paginate the results

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Permissions/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255', 'unique:permissions,title'],
        ]);

        Permission::create([
            'title' => $request->title,
        ]);

        return redirect()->route('permissions.index')->with('success', 'Permiso creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        return Inertia::render('Permissions/Show', [ // Optional: you might not need a 'Show' page for permissions
            'permission' => $permission,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Permission $permission)
    {
        return Inertia::render('Permissions/Edit', [
            'permission' => $permission,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255', Rule::unique('permissions')->ignore($permission->id)],
        ]);

        $permission->update([
            'title' => $request->title,
        ]);

        return redirect()->route('permissions.index')->with('success', 'Permiso actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     * This will soft delete the record due to the SoftDeletes trait.
     */
    public function destroy(Permission $permission)
    {
        $permission->delete(); // This performs a soft delete
        return redirect()->route('permissions.index')->with('success', 'Permiso eliminado (soft-deleted) exitosamente.');
    }

    /**
     * Restore a soft-deleted resource.
     */
    public function restore(Permission $permission)
    {
        // To restore, you need to use withTrashed() in the route model binding
        // Example route: Route::post('/permissions/{permission}/restore', [PermissionController::class, 'restore'])->name('permissions.restore')->withTrashed();
        $permission->restore();
        return redirect()->route('permissions.index')->with('success', 'Permiso restaurado exitosamente.');
    }

    /**
     * Permanently remove the specified resource from storage.
     * Use with caution!
     */
    public function forceDelete(Permission $permission)
    {
        // To force delete, you need to use withTrashed() in the route model binding
        // Example route: Route::delete('/permissions/{permission}/force-delete', [PermissionController::class, 'forceDelete'])->name('permissions.forceDelete')->withTrashed();
        $permission->forceDelete();
        return redirect()->route('permissions.index')->with('success', 'Permiso eliminado permanentemente.');
    }
}
