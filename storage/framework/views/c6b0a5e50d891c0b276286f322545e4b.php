<?php if($field['type'] === 'photo' || $field['type'] === 'file' || $field['type'] === 'signature'): ?>
    <?php if(is_string($field['value']) && strpos($field['value'], 'data:image/') === 0): ?>
        <?php if($field['type'] === 'signature'): ?>
            <img src="<?php echo e($field['value']); ?>" alt="Firma" class="field-signature" />
        <?php else: ?>
            <img src="<?php echo e($field['value']); ?>" alt="Imagen" class="field-image" />
        <?php endif; ?>
    <?php else: ?>
        <em><?php echo e(is_string($field['value']) ? basename($field['value']) : 'Archivo no disponible'); ?></em>
    <?php endif; ?>
<?php elseif(is_array($field['value'])): ?>
    <?php if(count($field['value']) > 0): ?>
        <ul class="checkbox-list">
            <?php $__currentLoopData = $field['value']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <li class="checkbox-checked"><?php echo e($item); ?></li>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </ul>
    <?php else: ?>
        <em>Sin selección</em>
    <?php endif; ?>
<?php elseif(is_bool($field['value'])): ?>
    <?php echo e($field['value'] ? 'Sí' : 'No'); ?>

<?php elseif(is_null($field['value']) || $field['value'] === ''): ?>
    <em>Sin respuesta</em>
<?php else: ?>
    <?php echo e($field['value']); ?>

<?php endif; ?>
<?php /**PATH C:\Users\Lenovo\Herd\devkpture\resources\views/pdfs/partials/field-value.blade.php ENDPATH**/ ?>