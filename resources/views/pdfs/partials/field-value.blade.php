@if($field['type'] === 'photo' || $field['type'] === 'file' || $field['type'] === 'signature')
    @if(is_string($field['value']) && strpos($field['value'], 'data:image/') === 0)
        @if($field['type'] === 'signature')
            <img src="{{ $field['value'] }}" alt="Firma" class="field-signature" />
        @else
            <img src="{{ $field['value'] }}" alt="Imagen" class="field-image" />
        @endif
    @else
        <em>{{ is_string($field['value']) ? basename($field['value']) : 'Archivo no disponible' }}</em>
    @endif
@elseif(is_array($field['value']))
    @if(count($field['value']) > 0)
        <ul class="checkbox-list">
            @foreach($field['value'] as $item)
                <li class="checkbox-checked">{{ $item }}</li>
            @endforeach
        </ul>
    @else
        <em>Sin selección</em>
    @endif
@elseif(is_bool($field['value']))
    {{ $field['value'] ? 'Sí' : 'No' }}
@elseif(is_null($field['value']) || $field['value'] === '')
    <em>Sin respuesta</em>
@else
    {{ $field['value'] }}
@endif
