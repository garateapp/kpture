<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::paginate(10);

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Roles/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255', 'unique:roles,title'],
        ]);

        Role::create([
            'title' => $request->title,
        ]);

        return redirect()->route('roles.index')->with('success', 'Rol creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        // Load the permissions associated with the role

        return Inertia::render('Roles/Show', [
            'role' => $role,

        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
         $role->load('permissions');

        // Get all available permissions for selection
        $allPermissions = Permission::select('id', 'title')->get();
        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'allPermissions' => $allPermissions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
            'permissions' => ['array'], // Ensure 'permissions' is an array
            'permissions.*' => ['exists:permissions,id'], // Ensure each permission ID exists
        ]);

        $role->update([
            'title' => $request->title,
        ]);

        // Synchronize the permissions for the role
        // `sync` will remove permissions not in the array and attach new ones.
        $role->permissions()->sync($request->input('permissions', [])); // Ensure an empty array is passed if no permissions

        return redirect()->route('roles.index')->with('success', 'Rol actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Rol eliminado exitosamente.');
    }
}
