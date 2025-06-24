<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFormsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('formulario', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('nombre');
            $table->integer('tipoformulario_id')->default(1); //public , group, department , ...
            $table->boolean('permite_edicion')->default(false);
            $table->string('identificador')->unique();
            $table->text('form_estructura_json')->nullable();
            $table->integer('estado_id')->default(1);
            $table->softDeletes();
            $table->timestamps();

            //$table->foreign('id')->references('id')->on('submitted_forms');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('forms');
    }
}
