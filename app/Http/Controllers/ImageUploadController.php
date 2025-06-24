<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str; // Para generar nombres de archivo únicos

class ImageUploadController extends Controller
{
    public function upload(Request $request, string $type) // Ahora recibe 'type' como parámetro de ruta
    {
        try {
            $request->validate([
                'image' => 'required|string',
            ]);

            // Validar que el tipo sea uno de los esperados
            if (!in_array($type, ['photo', 'signature'])) {
                throw ValidationException::withMessages([
                    'type' => 'Tipo de imagen no válido. Debe ser "photo" o "signature".'
                ]);
            }

            $base64Image = $request->input('image');

            if (!Str::startsWith($base64Image, 'data:image/')) {
                throw ValidationException::withMessages([
                    'image' => 'El formato de la imagen base64 no es válido.'
                ]);
            }

            @list($mimeTypeFull, $base64Image) = explode(';', $base64Image);
            @list(, $base64Image) = explode(',', $base64Image);

            $image = base64_decode($base64Image);

            if ($image === false) {
                 throw ValidationException::withMessages([
                    'image' => 'No se pudo decodificar la imagen base64.'
                ]);
            }

            $mimeType = explode(':', $mimeTypeFull)[1] ?? 'image/jpeg';
            $extension = 'jpg';

            if (str_contains($mimeType, 'image/png')) {
                $extension = 'png';
            } elseif (str_contains($mimeType, 'image/gif')) {
                $extension = 'gif';
            } elseif (str_contains($mimeType, 'image/webp')) {
                $extension = 'webp';
            }

            // Define la carpeta de destino basada en el 'type'
            $folder = $type . 's'; // Esto resultará en 'photos' o 'signatures'
            $filename = $folder . '/' . Str::uuid() . '.' . $extension;

            Storage::disk('public')->put($filename, $image);

            $publicUrl = Storage::disk('public')->url($filename);

            return response()->json(['message' => 'Imagen subida exitosamente.', 'url' => $publicUrl], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Los datos de la imagen no son válidos.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error al subir imagen: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al subir la imagen.', 'error' => $e->getMessage()], 500);
        }
    }
}
