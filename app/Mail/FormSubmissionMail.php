<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment; // Importa Attachment
use Illuminate\Queue\SerializesModels;

class FormSubmissionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $submissionData;
    public $formName;
    public $pdfPath; // Path al PDF generado
    public $customSubject;
    public $customBody;

    /**
     * Create a new message instance.
     */
    public function __construct(array $submissionData, string $formName, ?string $pdfPath = null, ?string $customSubject = null, ?string $customBody = null)
    {
        $this->submissionData = $submissionData;
        $this->formName = $formName;
        $this->pdfPath = $pdfPath;
        $this->customSubject = $customSubject;
        $this->customBody = $customBody;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->customSubject ?: 'Nuevo Envío de Formulario: ' . $this->formName;
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.form_submission', // Crear esta vista Blade (Paso 4.3)
            with: [
                'submissionData' => $this->submissionData,
                'formName' => $this->formName,
                'customBody' => $this->customBody,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        if ($this->pdfPath && file_exists($this->pdfPath)) {
            return [
                Attachment::fromPath($this->pdfPath)
                    ->as('formulario_completado_' . \Str::slug($this->formName) . '.pdf')
                    ->withMime('application/pdf'),
            ];
        }
        return [];
    }
}
