"use client"

// Importaciones necesarias
import React, { useState, useEffect } from "react"
import AppLayout from "@/layouts/app-layout"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Head, useForm, Link, router } from "@inertiajs/react"
import FormDesigner from "@/components/FormDesigner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { SaveIcon, CheckCircleIcon } from "lucide-react" // Importar iconos

// Definición de tipos de componentes del formulario (debe ser la misma que en FormDesigner/index.tsx)
interface FormComponent {
  id: string
  type: string
  props: { [key: string]: any }
  validation?: { [key: string]: any }
  options?: { value: string; label: string }[]
  children?: FormComponent[]
}

// Definición de tipos para las props del componente
interface EstadoData {
  id: number
  nombre: string
}

interface TipoFormularioData {
  id: number
  nombre: string
}
interface GrupoData {
  id: number
  nombre: string
}
interface FormularioData {
  id: number
  nombre: string
  tipoformulario_id: number
  permite_edicion: boolean
  identificador: string
  form_estructura_json: string // JSON string
  estado_id: number
  grupo_id?: number
  generate_pdf: boolean
  send_pdf_email: boolean
  email_recipients: string[]
  email_subject: string
  email_body: string
  created_at: string
  updated_at: string
}

interface FormularioEditProps {
  formulario: FormularioData
  estados: EstadoData[]
  tiposFormulario: TipoFormularioData[]
  grupos: GrupoData[]
}

export default function FormularioEdit({ formulario, estados, tiposFormulario, grupos }: FormularioEditProps) {
  const { data, setData, patch, processing, errors } = useForm({
    nombre: formulario.nombre || "",
    tipoformulario_id: formulario.tipoformulario_id.toString() || "",
    permite_edicion: formulario.permite_edicion || false,
    identificador: formulario.identificador || "",
    form_estructura_json: formulario.form_estructura_json || "[]",
    estado_id: formulario.estado_id.toString() || "",
    grupo_id: formulario.grupo_id ? formulario.grupo_id.toString() : "",
    generate_pdf: formulario.generate_pdf || false,
    send_pdf_email: formulario.send_pdf_email || false,
    email_recipients: formulario.email_recipients || [],
    email_subject: formulario.email_subject || "",
    email_body: formulario.email_body || "",
  })

  const [formStructure, setFormStructure] = useState<FormComponent[]>(
    JSON.parse(formulario.form_estructura_json || "[]"),
  )
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [newEmail, setNewEmail] = useState("")

  useEffect(() => {
    setData("form_estructura_json", JSON.stringify(formStructure))
  }, [formStructure, setData])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
   //
   try {
         patch(
          route("formularios.update", formulario.id),
          {
            //form_estructura_json: JSON.stringify(structure),
            _method: "patch",
          },
          {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
            //  setLastSavedTime(new Date())
              toast.success("Guardado automático", {
                description: "La estructura del formulario ha sido guardada automáticamente.",
              })
              //console.log("Auto-guardado exitoso.")
            },
            onError: (errors) => {
              toast.error("Error de auto-guardado", {
                description: "No se pudo guardar automáticamente el formulario. Revisa la consola.",
              })
              console.error("Error en auto-guardado:", errors)
            },
            onFinish: () => {
              setIsAutoSaving(false)
            },
          },
        )
      } catch (error) {
        console.error("Error inesperado durante el auto-guardado:", error)
        setIsAutoSaving(false)
        toast.error("Error inesperado", {
          description: "Ocurrió un error inesperado al intentar guardar el formulario.",
        })
      }
  }

  const handleFormStructureChange = React.useCallback((structure: FormComponent[]) => {
    setFormStructure(structure)
  }, [])

  const handleAutoSave = React.useCallback(
    async (structure: FormComponent[]) => {
      setIsAutoSaving(true)
      console.log("Iniciando auto-guardado...", structure)

      try {
        await patch(
          route("formularios.update", formulario.id),
          {
            form_estructura_json: JSON.stringify(structure),
            _method: "patch",
          },
          {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
              setLastSavedTime(new Date())
              toast.success("Guardado automático", {
                description: "La estructura del formulario ha sido guardada automáticamente.",
              })
              console.log("Auto-guardado exitoso.")
            },
            onError: (errors) => {
              toast.error("Error de auto-guardado", {
                description: "No se pudo guardar automáticamente el formulario. Revisa la consola.",
              })
              console.error("Error en auto-guardado:", errors)
            },
            onFinish: () => {
              setIsAutoSaving(false)
            },
          },
        )
      } catch (error) {
        console.error("Error inesperado durante el auto-guardado:", error)
        setIsAutoSaving(false)
        toast.error("Error inesperado", {
          description: "Ocurrió un error inesperado al intentar guardar el formulario.",
        })
      }
    },
    [formulario.id, patch],
  )

  const addEmail = () => {
    if (newEmail && !data.email_recipients.includes(newEmail)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(newEmail)) {
        setData("email_recipients", [...data.email_recipients, newEmail])
        setNewEmail("")
      } else {
        toast.error("Por favor ingresa un email válido")
      }
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setData(
      "email_recipients",
      data.email_recipients.filter((email) => email !== emailToRemove),
    )
  }

  const breadcrumbs = [
    {
      title: "Gestión de Formularios",
      href: "/formularios",
    },
    {
      title: `Editar Formulario: ${formulario.nombre}`,
      href: `/formularios/${formulario.id}/edit`,
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar Formulario: ${formulario.nombre}`} />
      <div className="container mx-auto p-6">
        <form onSubmit={submit}>
          {/* Metadatos del Formulario */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Formulario</Label>
                  <Input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={data.nombre}
                    className="w-full"
                    autoComplete="nombre"
                    onChange={(e) => setData("nombre", e.target.value)}
                    required
                  />
                  {errors.nombre && <div className="text-red-500 text-sm mt-1">{errors.nombre}</div>}
                </div>

                {/* Campo Identificador */}
                <div className="space-y-2">
                  <Label htmlFor="identificador">Identificador (Opcional, se autogenera si está vacío)</Label>
                  <Input
                    id="identificador"
                    type="text"
                    name="identificador"
                    value={data.identificador}
                    className="w-full"
                    autoComplete="identificador"
                    onChange={(e) => setData("identificador", e.target.value)}
                  />
                  {errors.identificador && <div className="text-red-500 text-sm mt-1">{errors.identificador}</div>}
                </div>

                {/* Selector de Tipo de Formulario */}
                <div className="space-y-2">
                  <Label htmlFor="tipoformulario_id">Tipo de Formulario</Label>
                  <Select onValueChange={(value) => setData("tipoformulario_id", value)} value={data.tipoformulario_id}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposFormulario.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipoformulario_id && (
                    <div className="text-red-500 text-sm mt-1">{errors.tipoformulario_id}</div>
                  )}
                </div>

                {/* Selector de Estado */}
                <div className="space-y-2">
                  <Label htmlFor="estado_id">Estado</Label>
                  <Select onValueChange={(value) => setData("estado_id", value)} value={data.estado_id}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.id} value={estado.id.toString()}>
                          {estado.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estado_id && <div className="text-red-500 text-sm mt-1">{errors.estado_id}</div>}
                </div>

                {/* Selector de Grupo */}
                <div className="space-y-2">
                  <Label htmlFor="grupo_id">Grupo</Label>
                  <Select onValueChange={(value) => setData("grupo_id", value)} value={data.grupo_id}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((grupo) => (
                        <SelectItem key={grupo.id} value={grupo.id.toString()}>
                          {grupo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.grupo_id && <div className="text-red-500 text-sm mt-1">{errors.grupo_id}</div>}
                </div>

                {/* Checkbox Permite Edición */}
                <div className="space-y-2 flex items-center col-span-full">
                  <Checkbox
                    id="permite_edicion"
                    checked={data.permite_edicion}
                    onCheckedChange={(checked) => setData("permite_edicion", checked === true)}
                  />
                  <Label htmlFor="permite_edicion" className="ml-2">
                    Permitir Edición después de ser completado
                  </Label>
                  {errors.permite_edicion && <div className="text-red-500 text-sm mt-1">{errors.permite_edicion}</div>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de PDF y Email */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configuración de PDF y Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Generar PDF */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate_pdf"
                  checked={data.generate_pdf}
                  onCheckedChange={(checked) => setData("generate_pdf", checked === true)}
                />
                <Label htmlFor="generate_pdf">Generar PDF al completar el formulario</Label>
              </div>
              {errors.generate_pdf && <div className="text-red-500 text-sm mt-1">{errors.generate_pdf}</div>}

              {/* Enviar por Email */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_pdf_email"
                  checked={data.send_pdf_email}
                  onCheckedChange={(checked) => setData("send_pdf_email", checked === true)}
                />
                <Label htmlFor="send_pdf_email">Enviar PDF por email</Label>
              </div>
              {errors.send_pdf_email && <div className="text-red-500 text-sm mt-1">{errors.send_pdf_email}</div>}

              {/* Configuración de Email - Solo visible si send_pdf_email está activado */}
              {data.send_pdf_email && (
                <div className="space-y-4 p-4 border rounded-lg">
                  {/* Destinatarios de Email */}
                  <div className="space-y-2">
                    <Label>Destinatarios de Email</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Ingresa un email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addEmail()
                          }
                        }}
                      />
                      <Button type="button" onClick={addEmail} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {data.email_recipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.email_recipients.map((email, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {email}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeEmail(email)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                    {errors.email_recipients && (
                      <div className="text-red-500 text-sm mt-1">{errors.email_recipients}</div>
                    )}
                  </div>

                  <Separator />

                  {/* Asunto del Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email_subject">Asunto del Email (Opcional)</Label>
                    <Input
                      id="email_subject"
                      type="text"
                      placeholder="Ej: Nuevo formulario completado - {nombre_formulario}"
                      value={data.email_subject}
                      onChange={(e) => setData("email_subject", e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Si se deja vacío, se usará: "Nuevo Envío de Formulario: [Nombre del Formulario]"
                    </p>
                    {errors.email_subject && <div className="text-red-500 text-sm mt-1">{errors.email_subject}</div>}
                  </div>

                  {/* Cuerpo del Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email_body">Mensaje del Email (Opcional)</Label>
                    <Textarea
                      id="email_body"
                      placeholder="Escribe un mensaje personalizado que se incluirá en el email..."
                      value={data.email_body}
                      onChange={(e) => setData("email_body", e.target.value)}
                      rows={4}
                    />
                    <p className="text-sm text-gray-500">
                      Si se deja vacío, se mostrará un mensaje predeterminado con los datos del formulario.
                    </p>
                    {errors.email_body && <div className="text-red-500 text-sm mt-1">{errors.email_body}</div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Área de Diseño del Formulario */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Diseñador de Formulario</CardTitle>
              <div className="flex items-center gap-2">
                {isAutoSaving ? (
                  <span className="text-sm text-muted-foreground animate-pulse flex items-center gap-1">
                    <SaveIcon className="h-4 w-4 text-primary" /> Guardando...
                  </span>
                ) : (
                  lastSavedTime && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircleIcon className="h-4 w-4" /> Guardado {lastSavedTime.toLocaleTimeString()}
                    </span>
                  )
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DndProvider backend={HTML5Backend}>
                <FormDesigner
                  initialFormStructure={formStructure}
                  onFormStructureChange={handleFormStructureChange}
                  onSaveFormStructure={handleAutoSave}
                  autoSaveInterval={20000}
                />
              </DndProvider>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end mt-6">
            <Link href={route("formularios.index")}>
              <Button variant="outline" className="mr-4">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              Actualizar Formulario
            </Button>
          </div>
        </form>
      </div>
      <Toaster />
    </AppLayout>
  )
}
