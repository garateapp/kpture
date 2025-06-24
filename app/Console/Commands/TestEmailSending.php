<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\FormSubmissionMail;

class TestEmailSending extends Command
{
    protected $signature = 'test:email {recipient}';
    protected $description = 'Test email sending functionality';

    public function handle()
    {
        $recipient = $this->argument('recipient');

        $this->info('Testing email sending to: ' . $recipient);

        try {
            // Datos de prueba
            $testData = [
                'nombre' => 'Juan Pérez',
                'email' => 'juan@example.com',
                'telefono' => '123456789',
                'mensaje' => 'Este es un mensaje de prueba'
            ];

            Mail::to($recipient)->send(new FormSubmissionMail(
                $testData,
                'Formulario de Prueba',
                null, // Sin PDF
                'Asunto de Prueba',
                'Este es el cuerpo personalizado del email de prueba.'
            ));

            $this->info('Email sent successfully to: ' . $recipient);
            return 0;

        } catch (\Exception $e) {
            $this->error('Error sending email: ' . $e->getMessage());
            $this->error('Trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
}
