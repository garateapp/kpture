<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Formulario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FixFormStructureJson extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'forms:fix-structure';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix form_estructura_json field to ensure it is properly stored as JSON';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking forms for JSON structure issues...');

        $forms = Formulario::all();
        $fixedCount = 0;

        foreach ($forms as $form) {
            $structure = $form->form_estructura_json;

            // Si es string, intentar decodificar
            if (is_string($structure)) {
                $this->info("Form #{$form->id} has string structure, attempting to decode...");

                try {
                    $decoded = json_decode($structure, true);

                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        // Si se decodificó correctamente, actualizar
                        DB::table('formulario')
                            ->where('id', $form->id)
                            ->update(['form_estructura_json' => json_encode($decoded)]);

                        $this->info("Fixed form #{$form->id}");
                        $fixedCount++;
                    } else {
                        $this->warn("Form #{$form->id} has invalid JSON structure: " . json_last_error_msg());
                    }
                } catch (\Exception $e) {
                    $this->error("Error processing form #{$form->id}: " . $e->getMessage());
                }
            } else {
                $this->info("Form #{$form->id} already has proper structure type: " . gettype($structure));
            }
        }

        $this->info("Fixed {$fixedCount} forms out of {$forms->count()} total.");

        return 0;
    }
}
