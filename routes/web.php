<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\EstadoController;
use App\Http\Controllers\GrupoController;
use App\Http\Controllers\TipoFormularioController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\FormularioController;
use App\Http\Controllers\SubmittedFormController;
use App\Http\Controllers\FormListController;
use App\Http\Controllers\ImageUploadController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Rutas para Usuarios
    Route::resource('users', UserController::class);

    // Rutas para Roles
    Route::resource('roles', RoleController::class);

    // Rutas para Estados
    Route::resource('estados', EstadoController::class);

    // Rutas para Grupos
    Route::resource('grupos', GrupoController::class);

    // Rutas para Tipo Formulario
    Route::resource('tipoformulario', TipoFormularioController::class);

    // Rutas para Permisos
    Route::resource('permissions', PermissionController::class);

    // **NUEVA RUTA para enviar el formulario**
    // Usamos un POST para el envío de datos
    Route::post('/formularios/{form}/submit', [SubmittedFormController::class, 'store'])
        ->name('formularios.submit');

    // NUEVA RUTA para la página de confirmación
    Route::get('/formularios/confirmacion', [SubmittedFormController::class, 'showConfirmation'])
        ->name('responder.formulario.confirmacion');

    // Nueva ruta para listar formularios a responder
    Route::get('/formularios/responder', [FormularioController::class, 'selectFormularioToRespond'])->name('formularios.select');

    // ######################################################################################################
    // NUEVA RUTA: Mis Respuestas
    Route::get('/formularios/mis-respuestas', [SubmittedFormController::class, 'myResponses'])->name('formularios.mis-respuestas');
    // Ruta para ver los detalles de una respuesta (GET)
    Route::get('/formularios/mis-respuestas-show/{id}', [SubmittedFormController::class, 'myResponsesShow'])->name('formularios.mis-respuestas-show');

    // ######################################################################################################
    // NUEVA RUTA: Para actualizar una respuesta (PATCH)
    Route::patch('/formularios/mis-respuestas/{submittedForm}', [SubmittedFormController::class, 'updateSubmittedForm'])->name('submitted-forms.update');
    // ######################################################################################################
    // ######################################################################################################

    // Nueva ruta para el componente de responder un formulario específico
    Route::get('/formularios/{formulario}/responder', [FormularioController::class, 'showFormularioToRespond'])->name('formularios.responder');
    // Rutas para Formularios por defecto (Index, Show Update, create etc)
    Route::resource('formularios', FormularioController::class);

    // ######################################################################################################
    // NUEVAS RUTAS: Para los listados dinámicos
    Route::get('/form-lists/entities', [FormListController::class, 'getEntities'])->name('form-lists.entities');
    Route::get('/form-lists/values/{entidad}', [FormListController::class, 'getValuesByEntity'])->name('form-lists.values');
    Route::get('/form-lists', [FormListController::class, 'index'])->name('form-lists.index');
    Route::get('/form-lists/create', [FormListController::class, 'create'])->name('form-lists.create');
    Route::post('/form-lists', [FormListController::class, 'store'])->name('form-lists.store');
    Route::get('/form-lists/{formList}/edit', [FormListController::class, 'edit'])->name('form-lists.edit');
    Route::put('/form-lists/{formList}', [FormListController::class, 'update'])->name('form-lists.update');
    Route::delete('/form-lists/{formList}', [FormListController::class, 'destroy'])->name('form-lists.destroy');
    Route::apiResource('form-lists', FormListController::class);
    // ######################################################################################################

    Route::post('/upload-image/{type}', [ImageUploadController::class, 'upload'])->name('api.upload-image');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
