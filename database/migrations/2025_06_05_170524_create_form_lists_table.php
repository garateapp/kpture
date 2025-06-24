<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('form_lists', function (Blueprint $table) {
            $table->id();
            $table->string('entidad'); // Nombre de la categoría de la lista (ej: 'Paises', 'Ciudades')
            $table->string('codigo');  // Valor que se guarda (ej: 'CL', 'NY')
            $table->string('valor');   // Texto que se muestra (ej: 'Chile', 'Nueva York')
            $table->timestamps();

            // Opcional: Asegurar que la combinación entidad-codigo sea única
            $table->unique(['entidad', 'codigo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_lists');
    }
};
