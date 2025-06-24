<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\PdfImageProcessor;
use Illuminate\Support\Facades\Storage;

class TestPdfWithImages extends Command
{
    protected $signature = 'test:pdf-images';
    protected $description = 'Test PDF generation with images';

    public function handle()
    {
        $this->info('Testing PDF generation with images...');

        try {
            // Datos de prueba con imágenes
            $testData = [
                'nombre' => 'Juan Pérez',
                'email' => 'juan@ejemplo.com',
                'foto_perfil' => '/storage/photos/test-image.jpg', // Asegúrate de que esta imagen exista
                'firma' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                'comentarios' => 'Este es un comentario de prueba'
            ];

            // Procesar imágenes
            $processedData = PdfImageProcessor::processImagesForPdf($testData);

            $this->info('Images processed successfully');

            // Generar PDF
            $pdf = Pdf::loadView('pdfs.form_submission', [
                'submissionData' => $processedData,
                'formName' => 'Formulario de Prueba',
                'submittedFormId' => 999,
                'submissionDate' => now()->format('d/m/Y H:i:s'),
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isPhpEnabled' => false,
                'isRemoteEnabled' => true,
                'defaultFont' => 'DejaVu Sans'
            ]);

            // Guardar PDF de prueba
            $fileName = 'test_pdf_with_images_' . now()->format('YmdHis') . '.pdf';
            $pdfPath = storage_path('app/temp/' . $fileName);

            // Crear directorio si no existe
            if (!is_dir(dirname($pdfPath))) {
                mkdir(dirname($pdfPath), 0755, true);
            }

            $pdf->save($pdfPath);

            $this->info('PDF with images generated successfully!');
            $this->info('File saved at: ' . $pdfPath);
            $this->info('File size: ' . number_format(filesize($pdfPath) / 1024, 2) . ' KB');

        } catch (\Exception $e) {
            $this->error('Error generating PDF with images: ' . $e->getMessage());
            $this->error('Trace: ' . $e->getTraceAsString());
        }
    }
}
