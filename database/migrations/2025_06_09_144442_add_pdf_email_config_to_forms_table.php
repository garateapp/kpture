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
        Schema::table('formulario', function (Blueprint $table) {
            $table->boolean('generate_pdf')->default(false)->after('deleted_at'); // Coloca después de una columna existente
            $table->boolean('send_pdf_email')->default(false)->after('generate_pdf');
            $table->json('email_recipients')->nullable()->after('send_pdf_email'); // Para guardar un array de emails
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('formulario', function (Blueprint $table) {
            $table->dropColumn(['generate_pdf', 'send_pdf_email', 'email_recipients']);
        });
    }
};
