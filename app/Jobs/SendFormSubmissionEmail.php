<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\FormSubmissionMail;

class SendFormSubmissionEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    protected $recipientEmail;
    protected $submissionData;
    protected $formName;
    protected $pdfPath;
    protected $customSubject;
    protected $customBody;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $recipientEmail,
        array $submissionData,
        string $formName,
        ?string $pdfPath = null,
        ?string $customSubject = null,
        ?string $customBody = null
    ) {
        $this->recipientEmail = $recipientEmail;
        $this->submissionData = $submissionData;
        $this->formName = $formName;
        $this->pdfPath = $pdfPath;
        $this->customSubject = $customSubject;
        $this->customBody = $customBody;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Processing email job for: ' . $this->recipientEmail);

            Mail::to($this->recipientEmail)->send(new FormSubmissionMail(
                $this->submissionData,
                $this->formName,
                $this->pdfPath,
                $this->customSubject,
                $this->customBody
            ));

            Log::info('Email sent successfully via job to: ' . $this->recipientEmail);

        } catch (\Exception $e) {
            Log::error('Failed to send email via job to ' . $this->recipientEmail . ': ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            throw $e; // Re-throw para que el job se marque como fallido
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Email job failed permanently for: ' . $this->recipientEmail, [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
