<!DOCTYPE html>
<html>
<head>
    <title>Formulario Completado: {{ $formName }}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #555;
            margin-bottom: 15px;
            background-color: #f8f9fa;
            padding: 8px 12px;
            border-left: 4px solid #007bff;
        }
        .field {
            margin-bottom: 12px;
            display: table;
            width: 100%;
        }
        .field-label {
            font-weight: bold;
            color: #666;
            display: table-cell;
            width: 200px;
            vertical-align: top;
            padding-right: 15px;
        }
        .field-value {
            display: table-cell;
            color: #333;
            vertical-align: top;
            word-wrap: break-word;
        }
        .field-image {
            max-width: 300px;
            max-height: 200px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 5px 0;
        }
        .field-signature {
            max-width: 200px;
            max-height: 100px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 5px 0;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .checkbox-list {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .checkbox-list li {
            margin: 3px 0;
        }
        .checkbox-checked::before {
            content: "✓ ";
            color: #28a745;
            font-weight: bold;
        }
        .checkbox-unchecked::before {
            content: "☐ ";
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Formulario Completado</h1>
        <p><strong>{{ $formName }}</strong></p>
        <p>Fecha de envío: {{ $submissionDate }}</p>
        @if(isset($submittedFormId))
            <p>ID de respuesta: #{{ $submittedFormId }}</p>
        @endif
    </div>

    <div class="content">
        @if(isset($groupedData['sections']) && count($groupedData['sections']) > 0)
            {{-- Mostrar datos agrupados por secciones --}}
            @foreach($groupedData['sections'] as $sectionName => $fields)
                <div class="section">
                    <div class="section-title">{{ $sectionName }}</div>
                    @foreach($fields as $field)
                        <div class="field">
                            <span class="field-label">{{ $field['label'] }}:</span>
                            <span class="field-value">
                                @include('pdfs.partials.field-value', ['field' => $field])
                            </span>
                        </div>
                    @endforeach
                </div>
            @endforeach

            {{-- Mostrar campos sin sección --}}
            @if(count($groupedData['ungrouped']) > 0)
                <div class="section">
                    <div class="section-title">Información General</div>
                    @foreach($groupedData['ungrouped'] as $field)
                        <div class="field">
                            <span class="field-label">{{ $field['label'] }}:</span>
                            <span class="field-value">
                                @include('pdfs.partials.field-value', ['field' => $field])
                            </span>
                        </div>
                    @endforeach
                </div>
            @endif
        @else
            {{-- Fallback: mostrar datos procesados sin agrupación --}}
            <div class="section">
                <div class="section-title">Datos del Formulario</div>
                @foreach($processedData as $field)
                    <div class="field">
                        <span class="field-label">{{ $field['label'] }}:</span>
                        <span class="field-value">
                            @include('pdfs.partials.field-value', ['field' => $field])
                        </span>
                    </div>
                @endforeach
            </div>
        @endif
    </div>

    <div class="footer">
        <p>Documento generado automáticamente el {{ now()->format('d/m/Y H:i:s') }}</p>
        <p>Este documento contiene información confidencial</p>
    </div>
</body>
</html>
