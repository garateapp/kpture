<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
   use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
      protected $fillable = [
        'name',
        'email',
        'password',
        'estado_id', // Agregado
        'grupo_id', // Agregado
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relación muchos a muchos con Role
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    // Relación uno a muchos con Estado
    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    // Método para verificar si el usuario tiene un rol específico
   public function hasRole($roleTitle): bool
    {
        return $this->roles->contains('title', $roleTitle);
    }
    // Relación uno a muchos con Grupo (si tienes un modelo Grupo)
    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }
}
