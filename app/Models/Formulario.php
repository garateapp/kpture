<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Importar SoftDeletes
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Importar BelongsTo

class Formulario extends Model
{
    use HasFactory, SoftDeletes; // Usar SoftDeletes

    public $table = 'formulario'; // Establece explícitamente el nombre de la tabla

    protected $fillable = [
        'user_id',
        'nombre',
        'tipoformulario_id',
        'permite_edicion',
        'identificador',
        'form_estructura_json',
        'estado_id',
        'grupo_id', // Si tienes un campo grupo_id, asegúrate de que esté en la migración
        'generate_pdf',     // <-- Añadir
        'send_pdf_email',   // <-- Añadir
        'email_recipients', // <-- Añadir
        'email_subject',    // <-- Nuevo
        'email_body',       // <-- Nuevo
    ];


    protected $casts = [
        'permite_edicion' => 'boolean',
        'form_estructura_json' => 'array', // Castear a array para manejar JSON automáticamente
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
        'deleted_at' => 'datetime:Y-m-d H:i:s',
        'email_recipients' => 'json', // Castear como JSON para manejar arrays
        'generate_pdf' => 'boolean',
        'send_pdf_email' => 'boolean',
    ];

    /**
     * Get the user that owns the Formulario.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tipoFormulario that owns the Formulario.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function tipoFormulario(): BelongsTo
    {
        return $this->belongsTo(TipoFormulario::class, 'tipoformulario_id');
    }

    /**
     * Get the estado that owns the Formulario.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }
    /**
     * Get the grupo that owns the Formulario.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
   public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class, 'grupo_id');
    }

    /**
     * Get the submitted forms for this form.
     */
    public function submittedForms(): HasMany
    {
        return $this->hasMany(SubmittedForm::class, 'form_id');
    }

    /**
     * Asegura que form_estructura_json siempre sea un array
     */
    public function getFormEstructuraJsonAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }

        return is_array($value) ? $value : [];
    }
}
