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
            $table->text('email_subject')->nullable()->after('email_recipients');
            $table->text('email_body')->nullable()->after('email_subject');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('formulario', function (Blueprint $table) {
            $table->dropColumn(['email_subject', 'email_body']);
        });
    }
};
