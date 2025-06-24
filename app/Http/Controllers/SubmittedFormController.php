<?php

namespace App\Http\Controllers;

use App\Models\Formulario;
use App\Models\SubmittedForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use App\Mail\FormSubmissionMail;
use App\Services\PdfImageProcessor;
use App\Services\PdfFormProcessor;

class SubmittedFormController extends Controller
{
    /**
     * Store a newly created submitted form in storage.
     */
   /**
     * Store a newly created submitted form in storage.
     */
    public function store(Request $request, Formulario $form)
    {
        $validator = Validator::make($request->all(), [
            'content' => ['required', 'array'],
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed for form submission:', $validator->errors()->toArray());
            return redirect()->back()->withErrors($validator->errors())->withInput();
        }

        $validatedData = $validator->validated();
        $submittedContent = $validatedData['content'];

        $pdfPath = null;

        try {
            $submittedForm = SubmittedForm::create([
                'form_id' => $form->id,
                'user_id' => auth()->check() ? auth()->id() : null,
                'content' => $submittedContent,
            ]);

            Log::info('Form submitted successfully', [
                'form_id' => $form->id,
                'submitted_form_id' => $submittedForm->id,
                'generate_pdf' => $form->generate_pdf,
                'send_pdf_email' => $form->send_pdf_email
            ]);

            // Preparar estructura del formulario
            $formStructure = $form->form_estructura_json;
            if (is_string($formStructure)) {
                $formStructure = json_decode($formStructure, true) ?? [];
                Log::info('Decoded form_estructura_json from string to array');
            }

            if (!is_array($formStructure)) {
                $formStructure = [];
                Log::warning('form_estructura_json is not valid, using empty array');
            }

            // Generar PDF si está configurado
            if ($form->generate_pdf) {
                Log::info('Starting PDF generation for form: ' . $form->nombre);

                try {
                    Log::info('Form structure for PDF processing', [
                        'structure_type' => gettype($formStructure),
                        'structure_count' => is_array($formStructure) ? count($formStructure) : 0,
                        'submission_data_keys' => array_keys($submittedContent)
                    ]);

                    // Procesar datos del formulario para PDF (con imágenes procesadas)
                    $processedData = PdfFormProcessor::processFormDataForPdf($submittedContent, $formStructure);
                    $groupedData = PdfFormProcessor::groupDataBySections($processedData);

                    Log::info('Form data processed for PDF generation', [
                        'processed_fields' => count($processedData),
                        'sections' => count($groupedData['sections']),
                        'ungrouped_fields' => count($groupedData['ungrouped'])
                    ]);

                    $pdf = Pdf::loadView('pdfs.form_submission', [
                        'processedData' => $processedData,
                        'groupedData' => $groupedData,
                        'formName' => $form->nombre,
                        'submittedFormId' => $submittedForm->id,
                        'submissionDate' => Carbon::parse($submittedForm->created_at)->format('d/m/Y H:i:s'),
                    ]);

                    $pdf->setPaper('A4', 'portrait');
                    $pdf->setOptions([
                        'isHtml5ParserEnabled' => true,
                        'isPhpEnabled' => false,
                        'isRemoteEnabled' => true,
                        'defaultFont' => 'DejaVu Sans'
                    ]);

                    $pdfTempDir = 'temp/form_pdfs';
                    if (!Storage::exists($pdfTempDir)) {
                        Storage::makeDirectory($pdfTempDir);
                        Log::info('Created PDF temp directory: ' . $pdfTempDir);
                    }

                    $fileName = 'formulario_completado_' . Str::slug($form->nombre) . '_' . Carbon::now()->format('YmdHis') . '.pdf';
                    $pdfPath = Storage::path($pdfTempDir . '/' . $fileName);

                    $directory = dirname($pdfPath);
                    if (!is_dir($directory)) {
                        mkdir($directory, 0755, true);
                    }

                    $pdf->save($pdfPath);
                    Log::info('PDF generated successfully at: ' . $pdfPath);

                } catch (\Exception $pdfException) {
                    Log::error('Error generating PDF: ' . $pdfException->getMessage(), [
                        'trace' => $pdfException->getTraceAsString(),
                        'form_id' => $form->id
                    ]);
                    $pdfPath = null;
                }
            }

            // Enviar Email si está configurado
            if ($form->send_pdf_email && !empty($form->email_recipients)) {
                Log::info('Starting email sending process', [
                    'recipients' => $form->email_recipients,
                    'pdf_path' => $pdfPath
                ]);

                // Procesar datos para el email (manteniendo URLs de imágenes)
                $processedDataForEmail = PdfFormProcessor::processFormDataForEmail($submittedContent, $formStructure);
                $emailData = PdfFormProcessor::convertToSimpleFormat($processedDataForEmail);

                Log::info('Email data processed', [
                    'email_fields' => array_keys($emailData),
                    'sample_data' => array_slice($emailData, 0, 3, true) // Mostrar solo los primeros 3 campos
                ]);

                $recipients = is_array($form->email_recipients) ? $form->email_recipients : [];

                foreach ($recipients as $recipientEmail) {
                    if (filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
                        try {
                            Mail::to($recipientEmail)->send(new FormSubmissionMail(
                                $emailData, // Usar datos procesados con labels y URLs de imágenes
                                $form->nombre,
                                $pdfPath,
                                $form->email_subject,
                                $form->email_body
                            ));

                            Log::info('Email sent successfully to: ' . $recipientEmail);
                        } catch (\Exception $mailException) {
                            Log::error('Error sending email to ' . $recipientEmail . ': ' . $mailException->getMessage(), [
                                'trace' => $mailException->getTraceAsString()
                            ]);
                        }
                    } else {
                        Log::warning("Invalid email address: " . $recipientEmail);
                    }
                }
            }

            // Limpiar el PDF temporal
            if ($pdfPath && file_exists($pdfPath)) {
                if (app()->environment('production')) {
                    unlink($pdfPath);
                    Log::info('Temporary PDF file deleted: ' . $pdfPath);
                } else {
                    Log::info('PDF file kept for debugging: ' . $pdfPath);
                }
            }

            return redirect()->route('responder.formulario.confirmacion')->with('success', 'Formulario enviado correctamente.');

        } catch (\Exception $e) {
            Log::error('Error processing form submission: ' . $e->getMessage(), [
                'form_id' => $form->id,
                'user_id' => auth()->check() ? auth()->id() : null,
                'content' => $submittedContent,
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Hubo un error al enviar el formulario: ' . $e->getMessage());
        }
    }

    /**
     * Generar PDF de una respuesta existente
     */
    public function generatePdf(SubmittedForm $submittedForm)
    {
        try {
            $submittedForm->load('form');

            // Asegurarse de que form_estructura_json sea un array
            $formStructure = $submittedForm->form->form_estructura_json;
            if (is_string($formStructure)) {
                $formStructure = json_decode($formStructure, true) ?? [];
            }

            // Si sigue siendo null o no es array, usar array vacío
            if (!is_array($formStructure)) {
                $formStructure = [];
            }

            // Procesar datos usando la estructura del formulario para PDF
            $processedData = PdfFormProcessor::processFormDataForPdf($submittedForm->content, $formStructure);
            $groupedData = PdfFormProcessor::groupDataBySections($processedData);

            $pdf = Pdf::loadView('pdfs.form_submission', [
                'processedData' => $processedData,
                'groupedData' => $groupedData,
                'formName' => $submittedForm->form->nombre,
                'submittedFormId' => $submittedForm->id,
                'submissionDate' => Carbon::parse($submittedForm->created_at)->format('d/m/Y H:i:s'),
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isPhpEnabled' => false,
                'isRemoteEnabled' => true,
                'defaultFont' => 'DejaVu Sans'
            ]);

            $fileName = 'respuesta_' . Str::slug($submittedForm->form->nombre) . '_' . $submittedForm->id . '.pdf';

            return $pdf->download($fileName);

        } catch (\Exception $e) {
            Log::error('Error generating PDF for submitted form: ' . $e->getMessage(), [
                'submitted_form_id' => $submittedForm->id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Error al generar el PDF: ' . $e->getMessage());
        }
    }
        public function show($id)
    {
        $submittedForm = SubmittedForm::findOrFail($id);
        $formData = json_decode($submittedForm->data, true);

        return response()->json($formData);
    }
 /**
     * Generar PDF de una respuesta existente
     */
//    public function generatePdf($id)
//     {
//         $submittedForm = SubmittedForm::findOrFail($id);
//         $submissionData = json_decode($submittedForm->data, true);

//         // Convert URLs absolutas a rutas relativas para imágenes locales
//         foreach ($submissionData as $key => $value) {
//             if (is_string($value) && strpos($value, 'https://devkpture.test/storage/') === 0) {
//                 // Convertir a ruta relativa
//                 $submissionData[$key] = str_replace(
//                     'https://devkpture.test/storage/',
//                     '/storage/',
//                     $value
//                 );
//             }
//         }

//         // Luego procesar con el servicio
//         $submissionData = \App\Services\PdfImageProcessor::processImagesForPdf($submissionData);

//         $pdf = PDF::loadView('pdf.form_submission', ['formData' => $submissionData]);

//         return $pdf->download('form_submission.pdf');
//     }
    /**
     * Muestra la página de confirmación después de enviar un formulario.
     */
    public function showConfirmation()
    {
        return Inertia::render('ResponderFormulario/Confirmation', [
            'message' => session('success', 'Formulario procesado correctamente.'),
        ]);
    }

    public function showResponseForm(Formulario $formulario)
    {
        return Inertia::render('ResponderFormulario/Show', [
            'formulario' => $formulario,
        ]);
    }

    public function myResponses()
    {
        $userSubmittedForms = SubmittedForm::where('user_id', auth()->id())
                                           ->with('form:id,nombre,identificador')
                                           ->latest()
                                           ->paginate(10);

        return Inertia::render('ResponderFormulario/MisRespuestas', [
            'submittedForms' => $userSubmittedForms,
        ]);
    }

    public function myResponsesShow(Request $request)
    {
        $submittedForm = SubmittedForm::with(['form' => function($query) {
                                $query->select('id', 'nombre', 'identificador', 'permite_edicion', 'grupo_id', 'tipoformulario_id', 'estado_id', 'form_estructura_json');
                            }])->findOrFail($request->id);

        if ($submittedForm->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('ResponderFormulario/MisRespuestasShow', [
            'submittedForm' => $submittedForm,
        ]);
    }

    public function updateSubmittedForm(Request $request, SubmittedForm $submittedForm)
    {
        $submittedForm->load('form');

        if (!$submittedForm->form || !$submittedForm->form->permite_edicion) {
            return back()->withErrors(['general' => 'Este formulario no permite edición después de ser enviado.']);
        }

        if ($submittedForm->user_id !== auth()->id()) {
            return back()->withErrors(['general' => 'No tienes permiso para editar esta respuesta.']);
        }

        $validator = Validator::make($request->all(), [
            'content' => ['required', 'array'],
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed for submitted form update:', $validator->errors()->toArray());
            return back()->withErrors($validator->errors()->toArray());
        }

        $submittedForm->content = $request->input('content');

        try {
            $submittedForm->save();
            Log::info('Submitted form updated successfully:', ['id' => $submittedForm->id]);
            return back()->with('success', 'La respuesta del formulario ha sido actualizada exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error updating submitted form:', ['error' => $e->getMessage(), 'id' => $submittedForm->id]);
            return back()->withErrors(['general' => 'Hubo un error al actualizar la respuesta: ' . $e->getMessage()]);
        }
    }

    public function edit(SubmittedForm $submittedForm)
    {
        //
    }

    public function update(Request $request, SubmittedForm $submittedForm)
    {
        //
    }

    public function destroy(SubmittedForm $submittedForm)
    {
        //
    }
}
