// resources/js/Pages/FormList/FormListModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import FormListService, { FormList } from '@/services/FormListService';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

interface FormListModalProps {
  isOpen: boolean;
  onClose: () => void;
  formListToEdit: FormList | null; // Null para crear, objeto para editar
}

const FormListModal: React.FC<FormListModalProps> = ({ isOpen, onClose, formListToEdit }) => {
  const [entidad, setEntidad] = useState('');
  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});


  useEffect(() => {
    if (isOpen) {
      if (formListToEdit) {
        // Modo edición
        setEntidad(formListToEdit.entidad);
        setCodigo(formListToEdit.codigo);
        setValor(formListToEdit.valor);
      } else {
        // Modo creación
        setEntidad('');
        setCodigo('');
        setValor('');
      }
      setErrors({}); // Limpiar errores al abrir
    }
  }, [isOpen, formListToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Limpiar errores previos

    const data = { entidad, codigo, valor };
    let response;

    if (formListToEdit && formListToEdit.id) {
      // Actualizar
      response = await FormListService.update(formListToEdit.id, data);
    } else {
      // Crear
      response = await FormListService.create(data);
    }

    if (response.data) {
      toast({
        title: "Éxito",
        description: `Entrada ${formListToEdit ? 'actualizada' : 'creada'} correctamente.`,
      });
      onClose(); // Cerrar modal y recargar lista
    } else {
      // Manejo de errores
      if (response.errors) {
        setErrors(response.errors);
      }
      toast({
        title: "Error",
        description: response.message || `No se pudo ${formListToEdit ? 'actualizar' : 'crear'} la entrada.`,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{formListToEdit ? 'Editar Entrada de Lista' : 'Nueva Entrada de Lista'}</DialogTitle>
          <DialogDescription>
            {formListToEdit ? 'Modifica los campos de la entrada de lista.' : 'Añade una nueva entrada a la lista de formulario.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="entidad" className="text-right">
              Entidad
            </Label>
            <Input
              id="entidad"
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              className={errors.entidad ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.entidad && <p className="col-span-4 text-red-500 text-sm">{errors.entidad[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="codigo" className="text-right">
              Código
            </Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className={errors.codigo ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.codigo && <p className="col-span-4 text-red-500 text-sm">{errors.codigo[0]}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valor" className="text-right">
              Valor
            </Label>
            <Input
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={errors.valor ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.valor && <p className="col-span-4 text-red-500 text-sm">{errors.valor[0]}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {formListToEdit ? 'Guardar Cambios' : 'Crear Entrada'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormListModal;
