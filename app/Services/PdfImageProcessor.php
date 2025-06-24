<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PdfImageProcessor
{
    /**
     * Procesa las imágenes en los datos del formulario para PDF
     */
    public static function processImagesForPdf(array $submissionData): array
    {
        $processedData = [];

        foreach ($submissionData as $key => $value) {
            if (is_string($value) && self::isImageUrl($value)) {
                $processedData[$key] = self::convertImageForPdf($value);
            } elseif (is_array($value)) {
                $processedData[$key] = self::processImagesForPdf($value);
            } else {
                $processedData[$key] = $value;
            }
        }

        return $processedData;
    }

    /**
     * Verifica si una cadena es una URL de imagen
     */
    public static function isImageUrl(string $url): bool
    {
        // Verificar si es una URL de imagen común
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));

        return in_array($extension, $imageExtensions) ||
               strpos($url, 'data:image/') === 0 ||
               strpos($url, '/storage/') !== false;
    }

    /**
     * Convierte una imagen para ser compatible con PDF
     */
    private static function convertImageForPdf(string $imageUrl): string
    {
        try {
            // Si ya es base64, verificar si es válido
            if (strpos($imageUrl, 'data:image/') === 0) {
                return self::optimizeBase64Image($imageUrl);
            }

            // Si es una URL local del storage
            if (strpos($imageUrl, '/storage/') !== false) {
                $relativePath = str_replace('/storage/', '', $imageUrl);

                if (Storage::disk('public')->exists($relativePath)) {
                    $fullPath = Storage::disk('public')->path($relativePath);
                    return self::convertFileToBase64($fullPath);
                }
            }

            // Si es una URL completa
            if (filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                return self::convertUrlToBase64($imageUrl);
            }

            // Si es un path local
            if (file_exists($imageUrl)) {
                return self::convertFileToBase64($imageUrl);
            }

            Log::warning('Could not process image for PDF: ' . $imageUrl);
            return $imageUrl;

        } catch (\Exception $e) {
            Log::error('Error processing image for PDF: ' . $e->getMessage(), [
                'image_url' => $imageUrl
            ]);
            return $imageUrl;
        }
    }

    /**
     * Optimiza una imagen base64 para PDF
     */
    private static function optimizeBase64Image(string $base64Image): string
    {
        try {
            if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $base64Image, $matches)) {
                $imageType = $matches[1];
                $imageData = base64_decode($matches[2]);

                $image = imagecreatefromstring($imageData);
                if (!$image) {
                    return $base64Image;
                }

                $width = imagesx($image);
                $height = imagesy($image);

                if ($width > 800) {
                    $newWidth = 800;
                    $newHeight = ($height * $newWidth) / $width;

                    $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
                    imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

                    ob_start();
                    imagejpeg($resizedImage, null, 80);
                    $optimizedData = ob_get_contents();
                    ob_end_clean();

                    imagedestroy($image);
                    imagedestroy($resizedImage);

                    return 'data:image/jpeg;base64,' . base64_encode($optimizedData);
                }
            }

            return $base64Image;

        } catch (\Exception $e) {
            Log::error('Error optimizing base64 image: ' . $e->getMessage());
            return $base64Image;
        }
    }

    /**
     * Convierte un archivo local a base64
     */
    private static function convertFileToBase64(string $filePath): string
    {
        try {
            if (!file_exists($filePath)) {
                return $filePath;
            }

            $imageData = file_get_contents($filePath);
            $mimeType = mime_content_type($filePath);

            $image = imagecreatefromstring($imageData);
            if ($image) {
                $width = imagesx($image);

                if ($width > 800) {
                    $height = imagesy($image);
                    $newWidth = 800;
                    $newHeight = ($height * $newWidth) / $width;

                    $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
                    imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

                    ob_start();
                    imagejpeg($resizedImage, null, 80);
                    $optimizedData = ob_get_contents();
                    ob_end_clean();

                    imagedestroy($image);
                    imagedestroy($resizedImage);

                    return 'data:image/jpeg;base64,' . base64_encode($optimizedData);
                }

                imagedestroy($image);
            }

            return 'data:' . $mimeType . ';base64,' . base64_encode($imageData);

        } catch (\Exception $e) {
            Log::error('Error converting file to base64: ' . $e->getMessage(), [
                'file_path' => $filePath
            ]);
            return $filePath;
        }
    }

    /**
     * Convierte una URL remota a base64
     */
    private static function convertUrlToBase64(string $url): string
    {
        try {
            if (strpos($url, 'devkpture.test') !== false || strpos($url, 'localhost') !== false) {
                $parsedUrl = parse_url($url);
                $relativePath = $parsedUrl['path'] ?? '';

                if (strpos($relativePath, '/storage/') === 0) {
                    $storagePath = str_replace('/storage/', '', $relativePath);
                    if (Storage::disk('public')->exists($storagePath)) {
                        $fullPath = Storage::disk('public')->path($storagePath);
                        return self::convertFileToBase64($fullPath);
                    }
                }

                $context = stream_context_create([
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ],
                    'http' => [
                        'timeout' => 10,
                        'user_agent' => 'Mozilla/5.0 (compatible; PDF Generator)'
                    ]
                ]);
            } else {
                $context = stream_context_create([
                    'http' => [
                        'timeout' => 10,
                        'user_agent' => 'Mozilla/5.0 (compatible; PDF Generator)'
                    ]
                ]);
            }

            $imageData = @file_get_contents($url, false, $context);
            if ($imageData === false) {
                Log::warning("No se pudo obtener la imagen: $url");
                return $url;
            }

            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($imageData);

            return 'data:' . $mimeType . ';base64,' . base64_encode($imageData);

        } catch (\Exception $e) {
            Log::error('Error converting URL to base64: ' . $e->getMessage(), [
                'url' => $url
            ]);

            if (strpos($url, 'devkpture.test') !== false || strpos($url, 'localhost') !== false) {
                try {
                    $path = parse_url($url, PHP_URL_PATH);
                    $publicPath = public_path(ltrim($path, '/'));

                    if (file_exists($publicPath)) {
                        return self::convertFileToBase64($publicPath);
                    }

                    if (strpos($path, '/storage/') === 0) {
                        $storagePath = 'public/' . substr($path, 9);
                        if (Storage::exists($storagePath)) {
                            return self::convertFileToBase64(Storage::path($storagePath));
                        }
                    }
                } catch (\Exception $innerEx) {
                    Log::error('Error en método alternativo: ' . $innerEx->getMessage());
                }
            }

            return $url;
        }
    }
}
