<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FormList;

class FormListsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ejemplo de datos para 'Paises'
        FormList::create(['entidad' => 'Paises', 'codigo' => 'CL', 'valor' => 'Chile']);
        FormList::create(['entidad' => 'Paises', 'codigo' => 'AR', 'valor' => 'Argentina']);
        FormList::create(['entidad' => 'Paises', 'codigo' => 'CO', 'valor' => 'Colombia']);
        FormList::create(['entidad' => 'Paises', 'codigo' => 'PE', 'valor' => 'Perú']);

        // Ejemplo de datos para 'TiposDeDocumento'
        FormList::create(['entidad' => 'TiposDeDocumento', 'codigo' => 'DNI', 'valor' => 'DNI']);
        FormList::create(['entidad' => 'TiposDeDocumento', 'codigo' => 'PAS', 'valor' => 'Pasaporte']);
        FormList::create(['entidad' => 'TiposDeDocumento', 'codigo' => 'CE', 'valor' => 'Cédula de Extranjería']);
    }
}
