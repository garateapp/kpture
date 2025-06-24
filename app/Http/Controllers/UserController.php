<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role; // Asegúrate de importar el modelo Role
use App\Models\Estado; // Asegúrate de importar el modelo Estado
use App\Models\Grupo; // Asegúrate de importar el modelo Grupo
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash; // Para encriptar contraseñas

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with(['roles', 'estado', 'grupo'])->paginate(10); // Cargar roles y estado

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all(['id', 'title']);
        $estados = Estado::all(['id', 'nombre']);
        $grupos=Grupo::all(['id', 'nombre']); // Si tienes un modelo Grupo, puedes cargarlo aquí
        return Inertia::render('Users/Create', [
            'roles' => $roles,
            'estados' => $estados,
            'userRoles' => [], // Inicialmente no hay roles asignados
            'grupos' =>$grupos , // Si tienes un modelo Grupo, puedes cargarlo aquí
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'roles' => ['array'],
            'roles.*' => ['exists:roles,id'],
            'estado_id' => ['nullable', 'exists:estados,id'],
            'grupo_id' => ['nullable', 'exists:grupos,id'], // Si tienes un modelo Grupo
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'estado_id' => $request->estado_id,
            'grupo_id' => $request->grupo_id, // Si tienes un modelo Grupo
        ]);

        if ($request->has('roles')) {
            $user->roles()->sync($request->roles);
        }

        return redirect()->route('users.index')->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load(['roles', 'estado']); // Cargar relaciones al mostrar

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $roles = Role::all(['id', 'title']);
        $estados = Estado::all(['id', 'nombre']);
        $grupos = Grupo::all(['id', 'nombre']); // Si tienes un modelo Grupo, puedes cargarlo aquí
        $user->load('roles'); // Cargar los roles asociados al usuario

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'estados' => $estados,
            'userRoles' => $user->roles->pluck('id')->toArray(), // ID de los roles del usuario
            'grupos' => $grupos,
            'allRoles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'], // Contraseña opcional al actualizar
            'roles' => ['array'],
            'roles.*' => ['exists:roles,id'],
            'estado_id' => ['nullable', 'exists:estados,id'],
            'grupo_id' => ['nullable', 'exists:grupos,id'], // Si tienes un modelo Grupo
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('password')) { // Solo actualizar si se proporciona una nueva contraseña
            $user->password = Hash::make($request->password);
        }
        $user->estado_id = $request->estado_id;
        $user->grupo_id = $request->grupo_id;
        $user->save();

        if ($request->has('roles')) {
            $user->roles()->sync($request->roles);
        } else {
            $user->roles()->detach(); // Si no se envían roles, desasociar todos
        }

        return redirect()->route('users.index')->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Usuario eliminado exitosamente.');
    }
}
