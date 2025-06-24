<!DOCTYPE html>
<html>
<head>
    <title>Nuevo Envío de Formulario</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        h2 { color: #333; margin-bottom: 20px; }
        .custom-body { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #007bff; }
        .data-section { margin-top: 30px; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 15px; padding: 12px; background-color: #f8f9fa; border-radius: 4px; }
        strong { font-weight: bold; color: #495057; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
        .image-link { color: #007bff; text-decoration: none; }
        .image-link:hover { text-decoration: underline; }
        .field-value { margin-top: 5px; }
        .image-container { margin-top: 8px; }
        .image-container img { max-width: 200px; height: auto; border-radius: 4px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <h2>¡Nuevo Envío de Formulario!</h2>
        <p>Se ha completado el formulario: <strong><?php echo e($formName); ?></strong>.</p>

        <?php if($customBody): ?>
            <div class="custom-body">
                <?php echo nl2br(e($customBody)); ?>

            </div>
        <?php else: ?>
            <p>A continuación, los datos enviados:</p>
        <?php endif; ?>

        <div class="data-section">
            <h3>Datos del Formulario:</h3>
            <ul>
                <?php $__currentLoopData = $submissionData; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <li>
                        <strong><?php echo e($key); ?>:</strong>
                        <div class="field-value">
                            <?php if(is_array($value)): ?>
                                <?php echo e(implode(', ', $value)); ?>

                            <?php elseif(is_string($value) && (strpos($value, 'http') === 0 || strpos($value, '/storage/') === 0)): ?>
                                
                                <div class="image-container">
                                    <a href="<?php echo e($value); ?>" class="image-link" target="_blank">Ver imagen</a>
                                    <br>
                                    <img src="<?php echo e($value); ?>" alt="Imagen adjunta" style="max-width: 200px; height: auto; margin-top: 5px;">
                                </div>
                            <?php else: ?>
                                <?php echo e($value); ?>

                            <?php endif; ?>
                        </div>
                    </li>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </ul>
        </div>

        <?php if(isset($customBody) && $customBody): ?>
            <div class="footer">
                <p>Este email incluye el formulario completado en formato PDF (si fue configurado).</p>
            </div>
        <?php else: ?>
            <div class="footer">
                <p>Este email incluye el formulario completado en formato PDF (si fue configurado).</p>
                <p>Gracias.</p>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
<?php /**PATH C:\Users\Lenovo\Herd\devkpture\resources\views/emails/form_submission.blade.php ENDPATH**/ ?>