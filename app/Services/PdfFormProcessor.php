<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Services\PdfImageProcessor;

class PdfFormProcessor
{
    /**
     * Procesa los datos del formulario usando la estructura para obtener las etiquetas correctas
     */
    public static function processFormDataForPdf(array $submissionData, array $formStructure): array
    {
        return self::processFormData($submissionData, $formStructure, 'pdf');
    }

    /**
     * Procesa los datos del formulario para email (mantiene URLs de imágenes)
     */
    public static function processFormDataForEmail(array $submissionData, array $formStructure): array
    {
        return self::processFormData($submissionData, $formStructure, 'email');
    }

    /**
     * Procesa los datos del formulario según el contexto (PDF o Email)
     */
    private static function processFormData(array $submissionData, array $formStructure, string $context = 'pdf'): array
    {
        $processedData = [];
        $fieldMap = self::createFieldMap($formStructure);

        Log::info("Processing form data for {$context}", [
            'submission_fields' => array_keys($submissionData),
            'structure_fields' => array_keys($fieldMap),
            'field_map_count' => count($fieldMap)
        ]);

        foreach ($submissionData as $fieldId => $value) {
            $fieldInfo = $fieldMap[$fieldId] ?? null;

            if ($fieldInfo) {
                $label = $fieldInfo['label'] ?? ucfirst(str_replace(['_', '-'], ' ', $fieldId));
                $processedValue = self::processFieldValue($value, $fieldInfo, $context);

                $processedData[] = [
                    'id' => $fieldId,
                    'label' => $label,
                    'value' => $processedValue,
                    'type' => $fieldInfo['type'] ?? 'text',
                    'section' => $fieldInfo['section'] ?? null
                ];

                Log::debug("Processed field for {$context}", [
                    'id' => $fieldId,
                    'label' => $label,
                    'type' => $fieldInfo['type'] ?? 'text'
                ]);
            } else {
                // Campo no encontrado en la estructura, usar ID como label
                $processedData[] = [
                    'id' => $fieldId,
                    'label' => ucfirst(str_replace(['_', '-'], ' ', $fieldId)),
                    'value' => self::processFieldValue($value, ['type' => 'text'], $context),
                    'type' => 'text',
                    'section' => null
                ];

                Log::warning('Field not found in structure', ['field_id' => $fieldId]);
            }
        }

        return $processedData;
    }

    /**
     * Crea un mapa de campos desde la estructura del formulario
     */
    private static function createFieldMap(array $formStructure): array
    {
        $fieldMap = [];

        // La estructura puede venir como array directo o dentro de 'components'
        $components = $formStructure;
        if (isset($formStructure['components']) && is_array($formStructure['components'])) {
            $components = $formStructure['components'];
        }

        if (is_array($components)) {
            foreach ($components as $component) {
                if (is_array($component)) {
                    self::extractFieldsFromComponent($component, $fieldMap);
                }
            }
        }

        Log::info('Created field map', [
            'total_fields' => count($fieldMap),
            'field_ids' => array_keys($fieldMap)
        ]);

        return $fieldMap;
    }

    /**
     * Extrae campos de un componente recursivamente
     */
    private static function extractFieldsFromComponent(array $component, array &$fieldMap, string $section = null): void
    {
        $componentType = $component['type'] ?? '';
        $componentId = $component['id'] ?? '';

        // Si es una sección, actualizar el contexto de sección
        if ($componentType === 'section' || $componentType === 'fieldset') {
            $section = $component['props']['label'] ?? $component['label'] ?? $component['title'] ?? $section;
        }

        // Si el componente tiene un ID, agregarlo al mapa
        if (!empty($componentId)) {
            $label = '';

            // Buscar label en diferentes ubicaciones posibles
            if (isset($component['props']['label'])) {
                $label = $component['props']['label'];
            } elseif (isset($component['label'])) {
                $label = $component['label'];
            } elseif (isset($component['title'])) {
                $label = $component['title'];
            } elseif (isset($component['props']['placeholder'])) {
                $label = $component['props']['placeholder'];
            }

            $fieldMap[$componentId] = [
                'label' => $label,
                'type' => $componentType,
                'options' => $component['options'] ?? [],
                'section' => $section,
                'entityName' => $component['entityName'] ?? null
            ];
        }

        // Procesar componentes anidados
        if (isset($component['components']) && is_array($component['components'])) {
            foreach ($component['components'] as $childComponent) {
                if (is_array($childComponent)) {
                    self::extractFieldsFromComponent($childComponent, $fieldMap, $section);
                }
            }
        }

        // Procesar campos en contenedores como columns, tabs, etc.
        if (isset($component['columns']) && is_array($component['columns'])) {
            foreach ($component['columns'] as $column) {
                if (isset($column['components']) && is_array($column['components'])) {
                    foreach ($column['components'] as $childComponent) {
                        if (is_array($childComponent)) {
                            self::extractFieldsFromComponent($childComponent, $fieldMap, $section);
                        }
                    }
                }
            }
        }
    }

    /**
     * Procesa el valor de un campo según su tipo y contexto
     */
    private static function processFieldValue($value, array $fieldInfo, string $context = 'pdf')
    {
        $fieldType = $fieldInfo['type'] ?? 'text';
        $options = $fieldInfo['options'] ?? [];

        switch ($fieldType) {
            case 'select':
            case 'radio':
                // Buscar la etiqueta correspondiente al valor en las opciones
                if (is_array($options) && !empty($options)) {
                    foreach ($options as $option) {
                        if (isset($option['value']) && $option['value'] == $value) {
                            return $option['label'] ?? $value;
                        }
                    }
                }

                // Si no se encuentra en opciones, devolver el valor tal como está
                return $value;

            case 'checkbox':
            case 'selectboxes':
                if (is_array($value)) {
                    $labels = [];
                    foreach ($value as $val) {
                        $found = false;
                        if (is_array($options) && !empty($options)) {
                            foreach ($options as $option) {
                                if (isset($option['value']) && $option['value'] == $val) {
                                    $labels[] = $option['label'] ?? $val;
                                    $found = true;
                                    break;
                                }
                            }
                        }
                        if (!$found) {
                            $labels[] = $val;
                        }
                    }
                    return $labels;
                }
                return $value;

            case 'file':
            case 'photo':
            case 'signature':
                // Manejar imágenes según el contexto
                if (is_string($value)) {
                    if ($context === 'email') {
                        // Para email, mantener la URL original
                        return $value;
                    } else {
                        // Para PDF, procesar la imagen
                        if (PdfImageProcessor::isImageUrl($value) ||
                            strpos($value, 'http') === 0 ||
                            strpos($value, '/storage/') === 0) {
                            return PdfImageProcessor::processImagesForPdf(['image' => $value])['image'];
                        }
                    }
                }
                return $value;

            case 'boolean':
                if (is_bool($value)) {
                    return $value ? 'Sí' : 'No';
                }
                // Manejar strings que representan booleanos
                if (is_string($value)) {
                    $lowerValue = strtolower($value);
                    if (in_array($lowerValue, ['true', '1', 'yes', 'sí', 'si'])) {
                        return 'Sí';
                    }
                    if (in_array($lowerValue, ['false', '0', 'no'])) {
                        return 'No';
                    }
                }
                return $value;

            case 'datetime':
            case 'date':
                if ($value && !empty($value)) {
                    try {
                        // Manejar formato ISO 8601
                        if (strpos($value, 'T') !== false) {
                            $date = new \DateTime($value);
                        } else {
                            $date = new \DateTime($value);
                        }

                        return $fieldType === 'date'
                            ? $date->format('d/m/Y')
                            : $date->format('d/m/Y H:i');
                    } catch (\Exception $e) {
                        Log::warning('Error parsing date: ' . $e->getMessage(), ['value' => $value]);
                        return $value;
                    }
                }
                return $value;

            case 'phone':
                // Formatear número de teléfono si es necesario
                if (is_string($value) && !empty($value)) {
                    // Remover caracteres no numéricos excepto + al inicio
                    $cleaned = preg_replace('/[^\d+]/', '', $value);
                    return $cleaned;
                }
                return $value;

            case 'email':
                // Validar y limpiar email
                if (is_string($value) && !empty($value)) {
                    return trim(strtolower($value));
                }
                return $value;

            default:
                return $value;
        }
    }

    /**
     * Agrupa los datos procesados por secciones
     */
    public static function groupDataBySections(array $processedData): array
    {
        $grouped = [
            'sections' => [],
            'ungrouped' => []
        ];

        foreach ($processedData as $field) {
            if (!empty($field['section'])) {
                if (!isset($grouped['sections'][$field['section']])) {
                    $grouped['sections'][$field['section']] = [];
                }
                $grouped['sections'][$field['section']][] = $field;
            } else {
                $grouped['ungrouped'][] = $field;
            }
        }

        return $grouped;
    }

    /**
     * Convierte los datos procesados a un formato simple para emails
     */
    public static function convertToSimpleFormat(array $processedData): array
    {
        $simpleData = [];

        foreach ($processedData as $field) {
            $simpleData[$field['label']] = $field['value'];
        }

        return $simpleData;
    }
}
