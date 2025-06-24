<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Formulario;

class SubmittedForm extends Model
{
    use HasFactory,SoftDeletes;
    public $table = 'submitted_forms'; // Establece explícitamente el nombre de la tabla
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'form_id',
        'user_id',
        'content',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'content' => 'array', // Castea el campo 'content' a array automáticamente
    ];

    /**
     * Get the form that owns the submitted form.
     */
    public function form()
    {
        return $this->belongsTo(Formulario::class);
    }

    /**
     * Get the user that submitted the form.
     */
    public function user()
    {
        return $this->belongsTo(User::class);

    }
 /**
     * Asegura que content siempre sea un array
     */
    public function getContentAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }

        return is_array($value) ? $value : [];
    }
}
