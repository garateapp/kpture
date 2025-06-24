// resources/js/Components/FormDesigner/index.tsx

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { v4 as uuidv4 } from "uuid"

// Importa componentes de Shadcn UI
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    TrashIcon,
    TextIcon,
    HeadingIcon,
    ListChecksIcon,
    ListOrderedIcon,
    CalendarIcon,
    ClockIcon,
    CalendarClockIcon,
    KeyIcon as SignatureIcon,
    QrCodeIcon,
    CameraIcon,
    FileIcon,
    MailIcon,
    PhoneIcon,
    ArrowDownNarrowWideIcon,
    SquareDotIcon,
    TypeIcon,
    MinusIcon,
    CircleDotIcon,
    SquareIcon,
    SaveIcon,
    CheckCircleIcon,
    PlusIcon, // Nuevo icono para añadir regla
} from "lucide-react"
import { cn } from "@/lib/utils" // Asegúrate de importar cn

// Definiciones de tipos

type ComponentType =
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "phone"
    | "date"
    | "time"
    | "datetime"
    | "select"
    | "select_dinamico" // <--- NUEVO TIPO
    | "checklist"
    | "radio"
    | "checkbox"
    | "signature"
    | "qr_scanner"
    | "photo"
    | "file"
    | "section"
    | "static_text"
    | "divider"

interface FormComponentProp {
  label?: string
  placeholder?: string
  content?: string
  rows?: number
  options?: { value: string; label: string }[]
  required?: boolean
  entity?: string; // <--- NUEVA PROP para select_dynamic
}

interface ValidationRules {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
}

// --- NUEVA DEFINICIÓN DE TIPOS PARA LÓGICA CONDICIONAL ---
interface ConditionalRule {
    id: string; // Para identificar la regla en la UI
    targetFieldId: string; // ID del campo que se verá afectado
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'not like'; // Operador de comparación
    value: string | number | boolean; // Valor con el que se compara
    action: 'skip' | 'hide' | 'show'; // Acción a realizar en targetFieldId
}

interface FormComponent {
    id: string
    type: ComponentType
    props: { [key: string]: any }
    validation?: { [key: string]: any }
    options?: { value: string; label: string }[]
    children?: FormComponent[]
    conditionalRules?: ConditionalRule[]; // ¡Nuevo campo!
 // ######################################################################################################
    // NUEVO CAMPO: Para almacenar el nombre de la entidad de la BD
    entityName?: string;
    // #########################################################################################################
}
// --- FIN NUEVA DEFINICIÓN DE TIPOS ---

interface ComponentPaletteItem {
    type: string
    label: string
    defaultProps: { [key: string]: any }
    defaultValidation?: { [key: string]: any }
    options?: { value: string; label: string }[]
    icon: React.ReactNode
}

// ItemTypes para react-dnd
const ItemTypes = {
    COMPONENT: "component",
    PALETTE_ITEM: "palette_item",
}

// Componente individual de la paleta (arrastrable)
const DraggablePaletteItem: React.FC<{ item: ComponentPaletteItem }> = ({ item }) => {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ItemTypes.PALETTE_ITEM,
            item: {
                type: item.type,
                defaultProps: item.defaultProps,
                defaultValidation: item.defaultValidation,
                options: item.options,
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [item],
    )

    return (
        <Button
            ref={drag}
            variant="outline"
            className="flex items-center justify-start gap-2 py-2 px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-grab"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {item.icon} {item.label}
        </Button>
    )
}

// Componente FormField (vista previa del campo)
const FormField: React.FC<{
    component: FormComponent
    index: number
    moveComponent: (dragIndex: number, hoverIndex: number) => void
    onSelect: (component: FormComponent) => void
    onDelete: (id: string) => void
    selectedComponentId: string | null
}> = React.memo(({ component, index, moveComponent, onSelect, onDelete, selectedComponentId }) => {
    const ref = useRef<HTMLDivElement>(null)
    const isSelected = selectedComponentId === component.id

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ItemTypes.COMPONENT,
            item: { id: component.id, index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [component.id, index],
    )

    const [, drop] = useDrop(
        () => ({
            accept: ItemTypes.COMPONENT,
            hover(item: { id: string; index: number }, monitor) {
                if (!ref.current) return
                if (!monitor.isOver({ shallow: true })) return
                if (item.id === component.id) return

                const dragIndex = item.index
                const hoverIndex = index

                if (dragIndex === hoverIndex) return

                moveComponent(dragIndex, hoverIndex)
                item.index = hoverIndex
            },
        }),
        [component.id, index, moveComponent],
    )

    // Combinar refs de manera segura
    const setRef = useCallback(
        (node: HTMLDivElement | null) => {
            ref.current = node
            drag(node)
            drop(node)
        },
        [drag, drop],
    )

    const handleSelect = useCallback(() => {
        onSelect(component)
    }, [onSelect, component])

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            onDelete(component.id)
        },
        [onDelete, component.id],
    )

    const renderPreview = (comp: FormComponent) => {
        switch (comp.type) {
            case "text":
            case "number":
            case "email":
            case "phone":
                return <Input placeholder={comp.props.placeholder || "Campo de texto"} disabled />
            case "textarea":
                return <Textarea placeholder={comp.props.placeholder || "Campo de texto largo"} disabled />
            case "select":
             case "select_dinamico":
            case "checklist":
           case "radio":
             // AÑADE ESTE CONSOLE.LOG TEMPORALMENTE
          console.log(`Component ID: ${component.id}, Type: ${component.type}, Options:`, component.options);
                // Muestra si tiene opciones manuales o si tiene una entidad de BD
                const hasManualOptions = comp.options && comp.options.length > 0;
                const hasEntityOptions = comp.entityName;

                return (
                    <div className="flex flex-col gap-1">
                        {hasManualOptions && comp.options?.map((opt, i) => (
                            <Label key={i} className="flex items-center gap-2">
                                {comp.type === "radio" ? (
                                    <Input type="radio" className="w-4 h-4" disabled />
                                ) : (
                                    <Input type="checkbox" className="w-4 h-4" disabled />
                                )}
                                {opt.label}
                            </Label>
                        ))}
                        {hasEntityOptions && (
                            <span className="text-sm text-blue-600">
                                Opciones desde BD: **{comp.entityName}**
                            </span>
                        )}
                        {!hasManualOptions && !hasEntityOptions && (
                            <span className="text-sm text-muted-foreground">Sin opciones definidas</span>
                        )}
                    </div>
                );
            case "checkbox":
                return (
                    <Label className="flex items-center gap-2">
                        <Input type="checkbox" className="w-4 h-4" disabled />
                        {comp.props.label}
                    </Label>
                )
            case "date":
            case "time":
            case "datetime":
                return <Input type="text" placeholder={`Campo de ${comp.type}`} disabled />
            case "signature":
                return (
                    <Button variant="outline" disabled>
                        Campo de Firma
                    </Button>
                )
            case "qr_scanner":
                return (
                    <Button variant="outline" disabled>
                        Escanear QR
                    </Button>
                )
            case "photo":
                return (
                    <Button variant="outline" disabled>
                        Tomar Foto
                    </Button>
                )
            case "file":
                return (
                    <Button variant="outline" disabled>
                        Seleccionar Archivo
                    </Button>
                )
            case "static_text":
                return (
                    <div
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: comp.props.content || "Texto estático" }}
                    />
                )
            case "divider":
                return <hr className="my-2 border-dashed border-border" />
            default:
                return <Input placeholder={`Tipo de componente desconocido: ${comp.type}`} disabled />
        }
    }

    return (
        <Card
            ref={setRef}
            className={`mb-2 cursor-grab ${isSelected ? "border-primary ring-2 ring-primary/50" : "border-border"} ${isDragging ? "opacity-50" : ""}`}
            onClick={handleSelect}
        >
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
                <CardTitle className="text-sm font-semibold">
                    {component.props.label || component.type.replace(/_/g, " ").toUpperCase()}
                </CardTitle>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDelete}>
                        <span className="sr-only">Eliminar</span>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <Label className="mb-1 block text-xs text-muted-foreground">{component.props.label || "Sin etiqueta"}</Label>
                {renderPreview(component)}
            </CardContent>
        </Card>
    )
})

FormField.displayName = "FormField"

// Panel de propiedades
const PropertiesPanel: React.FC<{
    component: FormComponent
    onUpdate: (id: string, newProps: Partial<FormComponent>) => void
    onClose: () => void
    allComponents: FormComponent[]; // ¡NUEVO PROP! Lista de todos los componentes para el selector
}> = ({ component, onUpdate, onClose, allComponents }) => {
    const [currentProps, setCurrentProps] = useState(component.props)
    const [currentValidation, setCurrentValidation] = useState(component.validation || {})
    const [currentOptions, setCurrentOptions] = useState(component.options || [])
    const [conditionalRules, setConditionalRules] = useState<ConditionalRule[]>(component.conditionalRules || []); // ¡NUEVO ESTADO!
     // ######################################################################################################
    // NUEVO ESTADO: Para el tipo de fuente de opciones (manual o de base de datos)
    const [optionsSource, setOptionsSource] = useState<'manual' | 'database'>(
        component.entityName ? 'database' : 'manual'
    );
    // NUEVO ESTADO: Para almacenar los nombres de las entidades disponibles desde el backend
    const [entityNames, setEntityNames] = useState<string[]>([]);
    // ######################################################################################################
    // Filtra los componentes que pueden ser "saltados" (no el actual y no divisores/secciones/texto estático)
    const targetableComponents = allComponents.filter(
        (comp) =>
            comp.id !== component.id &&
            comp.type !== "divider" &&
            comp.type !== "section" &&
            comp.type !== "static_text",
    ).map(comp => ({
        id: comp.id,
        label: comp.props.label || `Campo ${comp.type.replace(/_/g, " ")} (${comp.id.substring(0, 4)}...)`
    }));


    // Sincronizar estado interno solo cuando el componente cambie
  useEffect(() => {
        setCurrentProps(component.props);
        setCurrentValidation(component.validation || {});
        setCurrentOptions(component.options || []);
        setConditionalRules(component.conditionalRules || []);
        // ######################################################################################################
        // Sincronizar el origen de las opciones
        setOptionsSource(component.entityName ? 'database' : 'manual');
        // ######################################################################################################
    }, [component.id]);

    // ######################################################################################################
    // NUEVO useEffect: Cargar nombres de entidades desde el backend al montar el panel
    useEffect(() => {
        const fetchEntityNames = async () => {
            try {
                // Asume que tu backend Laravel está en la misma URL
                const response = await fetch('/form-lists/entities');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setEntityNames(data);
            } catch (error) {
                console.error("Error fetching entity names:", error);
                // Manejar error, quizás mostrar un mensaje al usuario
            }
        };
        // Solo ejecutar esta función si el tipo de componente es uno que requiere opciones
        if (component.type === 'select' || component.type === 'checklist' || component.type === 'radio' || component.type === 'select_dinamico') {
            fetchEntityNames();

        }
    }, [component.type]); // Ejecutar solo cuando el tipo de componente cambie o al montar
    // ######################################################################################################


    const handleChange = useCallback(
        (key: string, value: any) => {
            const updatedProps = { ...currentProps, [key]: value }
            setCurrentProps(updatedProps)
            onUpdate(component.id, { props: updatedProps })
        },
        [currentProps, onUpdate, component.id],
    )

    const handleValidationChange = useCallback(
        (key: string, value: any) => {
            const updatedValidation = { ...currentValidation, [key]: value }
            setCurrentValidation(updatedValidation)
            onUpdate(component.id, { validation: updatedValidation })
        },
        [currentValidation, onUpdate, component.id],
    )

    const handleOptionChange = useCallback(
        (index: number, key: "label" | "value", value: string) => {
            const updatedOptions = [...currentOptions]
            updatedOptions[index] = { ...updatedOptions[index], [key]: value }
            setCurrentOptions(updatedOptions)
            onUpdate(component.id, { options: updatedOptions })
        },
        [currentOptions, onUpdate, component.id],
    )

    const addOption = useCallback(() => {
        const newOptions = [...currentOptions, { label: "", value: "" }]
        setCurrentOptions(newOptions)
        onUpdate(component.id, { options: newOptions })
    }, [currentOptions, onUpdate, component.id])

    const removeOption = useCallback(
        (index: number) => {
            const newOptions = currentOptions.filter((_, i) => i !== index)
            setCurrentOptions(newOptions)
            onUpdate(component.id, { options: newOptions })
        },
        [currentOptions, onUpdate, component.id],
    )

    // --- MANEJO DE LÓGICA CONDICIONAL ---
    const addConditionalRule = useCallback(() => {
        const newRule: ConditionalRule = {
            id: uuidv4(),
            targetFieldId: targetableComponents[0]?.id || '', // Selecciona el primer campo disponible por defecto
            operator: '=',
            value: '',
            action: 'skip',
        };
        const updatedRules = [...conditionalRules, newRule];
        setConditionalRules(updatedRules);
        onUpdate(component.id, { conditionalRules: updatedRules });
    }, [conditionalRules, onUpdate, component.id, targetableComponents]);

    const updateConditionalRule = useCallback(
        (ruleId: string, key: keyof ConditionalRule, value: any) => {
            const updatedRules = conditionalRules.map((rule) =>
                rule.id === ruleId ? { ...rule, [key]: value } : rule,
            );
            setConditionalRules(updatedRules);
            onUpdate(component.id, { conditionalRules: updatedRules });
        },
        [conditionalRules, onUpdate, component.id],
    );

    const removeConditionalRule = useCallback(
        (ruleId: string) => {
            const updatedRules = conditionalRules.filter((rule) => rule.id !== ruleId);
            setConditionalRules(updatedRules);
            onUpdate(component.id, { conditionalRules: updatedRules });
        },
        [conditionalRules, onUpdate, component.id],
    );
    // --- FIN MANEJO DE LÓGICA CONDICIONAL ---


    const renderPropInput = useCallback(
        (propKey: string, propValue: any, type = "text") => {
            switch (type) {
                case "text":
                    return (
                        <Input
                            type="text"
                            value={propValue || ""}
                            onChange={(e) => handleChange(propKey, e.target.value)}
                            className="col-span-2"
                        />
                    )
                case "textarea":
                    return (
                        <Textarea
                            value={propValue || ""}
                            onChange={(e) => handleChange(propKey, e.target.value)}
                            className="col-span-2"
                        />
                    )
                case "boolean":
                    return (
                        <input
                            type="checkbox"
                            checked={propValue === true}
                            onChange={(e) => handleChange(propKey, e.target.checked)}
                            className="w-4 h-4 ml-2"
                        />
                    )
                case "number":
                    return (
                        <Input
                            type="number"
                            value={propValue || ""}
                            onChange={(e) => handleChange(propKey, Number.parseFloat(e.target.value) || 0)}
                            className="col-span-2"
                        />
                    )
                default:
                    return null
            }
        },
        [handleChange],
    )

     // ######################################################################################################
    // NUEVA FUNCIÓN: Manejar cambio en el origen de las opciones (Manual/Database)
    const handleOptionsSourceChange = useCallback((source: 'manual' | 'database') => {
        setOptionsSource(source);
        if (source === 'manual') {
            // Si cambia a manual, limpiamos entityName
            onUpdate(component.id, { options: currentOptions, entityName: undefined });
        } else {
            // Si cambia a database, limpiamos las opciones manuales
            onUpdate(component.id, { options: undefined, entityName: entityNames[0] || undefined });
        }
    }, [currentOptions, entityNames, onUpdate, component.id]);

    // NUEVA FUNCIÓN: Manejar cambio en la entidad seleccionada de la BD
    const handleEntityNameChange = useCallback((entity: string) => {
        onUpdate(component.id, { entityName: entity });
    }, [onUpdate, component.id]);
    // ######################################################################################################

    return (
        <div className="w-80 p-4 border-l bg-card text-card-foreground h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
                Propiedades del Componente: {component.props.label || component.type}
            </h3>
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-3"> {/* Ajustado a 3 columnas para la nueva pestaña */}
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="validation">Validación</TabsTrigger>
                    {(component.type === "select" || component.type === "checklist" || component.type === "radio") && (
                        <TabsTrigger value="options">Opciones</TabsTrigger>
                    )}
                    <TabsTrigger value="conditional-logic">Lógica Condicional</TabsTrigger> {/* ¡NUEVA PESTAÑA! */}
                </TabsList>
                <TabsContent value="general" className="mt-4">
                    <div className="grid grid-cols-3 items-center gap-4 mb-3">
                        <Label>Etiqueta</Label>
                        {renderPropInput("label", currentProps.label, "text")}
                    </div>
                    {component.type !== "section" && component.type !== "divider" && component.type !== "static_text" && (
                        <div className="grid grid-cols-3 items-center gap-4 mb-3">
                            <Label>Placeholder</Label>
                            {renderPropInput("placeholder", currentProps.placeholder, "text")}
                        </div>
                    )}
                    {component.type === "static_text" && (
                        <div className="grid grid-cols-3 items-center gap-4 mb-3">
                            <Label>Contenido</Label>
                            {renderPropInput("content", currentProps.content, "textarea")}
                        </div>
                    )}
                     {/* ###################################################################################################### */}
                    {/* Nuevas propiedades específicas para el tipo 'select' */}
                    {component.type === 'select' || component.type==='select_dinamico' && (
                        <>
                            <div className="grid grid-cols-3 items-center gap-4 mb-3">
                                <Label>Multiselección</Label>
                                {renderPropInput('multiple', currentProps.multiple, 'boolean')}
                            </div>
                        </>
                    )}
                    {/* ###################################################################################################### */}
                    {component.type !== "section" && component.type !== "divider" && component.type !== "static_text" && (
                        <div className="grid grid-cols-3 items-center gap-4 mb-3">
                            <Label>Requerido</Label>
                            {renderPropInput("required", currentProps.required, "boolean")}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="validation" className="mt-4">
                    <h4 className="text-md font-semibold mb-2">Reglas de Validación</h4>
                    {(component.type === "text" || component.type === "textarea") && (
                        <>
                            <div className="grid grid-cols-3 items-center gap-4 mb-3">
                                <Label>Mín. Caracteres</Label>
                                <Input
                                    type="number"
                                    value={currentValidation.minLength || ""}
                                    onChange={(e) => handleValidationChange("minLength", Number.parseInt(e.target.value) || undefined)}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4 mb-3">
                                <Label>Máx. Caracteres</Label>
                                <Input
                                    type="number"
                                    value={currentValidation.maxLength || ""}
                                    onChange={(e) => handleValidationChange("maxLength", Number.parseInt(e.target.value) || undefined)}
                                    className="col-span-2"
                                />
                            </div>
                        </>
                    )}
                    {component.type === "number" && (
                        <>
                            <div className="grid grid-cols-3 items-center gap-4 mb-3">
                                <Label>Mín. Valor</Label>
                                <Input
                                    type="number"
                                    value={currentValidation.min || ""}
                                    onChange={(e) => handleValidationChange("min", Number.parseFloat(e.target.value) || undefined)}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4 mb-3">
                                <Label>Máx. Valor</Label>
                                <Input
                                    type="number"
                                    value={currentValidation.max || ""}
                                    onChange={(e) => handleValidationChange("max", Number.parseFloat(e.target.value) || undefined)}
                                    className="col-span-2"
                                />
                            </div>
                        </>
                    )}
                </TabsContent>

                {(component.type === "select" || component.type === "checklist" || component.type === "radio" || component.type === "select_dinamico") && (
                    <TabsContent value="options" className="mt-4">
                         {/* ###################################################################################################### */}
                        {/* Selector de origen de opciones */}
                        <div className="mb-4">
                            <Label className="block mb-2">Origen de las opciones</Label>
                            <Select onValueChange={handleOptionsSourceChange} value={optionsSource}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar origen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="database">Base de Datos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {optionsSource === 'manual' && (
                            <>
                                {currentOptions.map((option, index) => (
                                    <div key={index} className="grid grid-cols-4 items-center gap-2 mb-2">
                                        <Label className="col-span-1">Opción {index + 1}</Label>
                                        <Input
                                            type="text"
                                            value={option.label}
                                            onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                            placeholder="Etiqueta"
                                            className="col-span-1"
                                        />
                                        <Input
                                            type="text"
                                            value={option.value}
                                            onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                            placeholder="Valor"
                                            className="col-span-1"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                            <TrashIcon className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <Button onClick={addOption} variant="outline" className="mt-2">
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Añadir Opción
                                </Button>
                            </>
                        )}

                        {optionsSource === 'database' && (
                            <div className="mb-4">
                                <Label className="block mb-2">Seleccionar Entidad</Label>
                                <Select onValueChange={handleEntityNameChange} value={component.entityName || ''}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccionar una entidad de BD" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {entityNames.length > 0 ? (
                                            entityNames.map((name) => (
                                                <SelectItem key={name} value={name}>
                                                    {name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="" disabled>No hay entidades disponibles</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {component.entityName && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Este campo cargará las opciones de la entidad "{component.entityName}" de la base de datos.
                                    </p>
                                )}
                                {entityNames.length === 0 && (
                                    <p className="text-sm text-red-500 mt-2">
                                        No se pudieron cargar entidades. Asegúrate que el backend está funcionando y tiene datos.
                                    </p>
                                )}
                            </div>
                        )}
                        {/* ###################################################################################################### */}

                    </TabsContent>
                )}
                {/* --- NUEVA PESTAÑA: LÓGICA CONDICIONAL --- */}
                <TabsContent value="conditional-logic" className="mt-4">
                    <h4 className="text-md font-semibold mb-2">Reglas de Salto/Visibilidad</h4>
                    {targetableComponents.length === 0 && (
                        <p className="text-sm text-muted-foreground mb-4">
                            Añade más campos al formulario para poder crear reglas condicionales.
                        </p>
                    )}
                    {conditionalRules.length === 0 && targetableComponents.length > 0 && (
                        <p className="text-sm text-muted-foreground mb-4">
                            Define reglas para saltar u ocultar otros campos basadas en el valor de este control.
                        </p>
                    )}
                    {conditionalRules.map((rule) => (
                        <Card key={rule.id} className="mb-4 p-3 border">
                            <div className="flex justify-end">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeConditionalRule(rule.id)}>
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Si este campo es</Label>
                                <Select
                                    value={rule.operator}
                                    onValueChange={(value) => updateConditionalRule(rule.id, 'operator', value as ConditionalRule['operator'])}
                                >
                                    <SelectTrigger className="w-full text-sm">
                                        <SelectValue placeholder="Operador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="=">Igual a (=)</SelectItem>
                                        <SelectItem value="!=">Diferente a (!=)</SelectItem>
                                        <SelectItem value=">">Mayor que </SelectItem>
                                        <SelectItem value="<">Menor que </SelectItem>
                                        <SelectItem value=">=">Mayor o igual que</SelectItem>
                                        <SelectItem value="<=">Menor o igual que</SelectItem>
                                        <SelectItem value="like">Contiene (like)</SelectItem>
                                        <SelectItem value="not like">No Contiene (not like)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Valor a comparar"
                                    value={rule.value as string} // Casteamos a string por ahora
                                    onChange={(e) => updateConditionalRule(rule.id, 'value', e.target.value)}
                                />
                                <Label className="text-xs">Entonces</Label>
                                <Select
                                    value={rule.action}
                                    onValueChange={(value) => updateConditionalRule(rule.id, 'action', value as ConditionalRule['action'])}
                                >
                                    <SelectTrigger className="w-full text-sm">
                                        <SelectValue placeholder="Acción" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="skip">Saltar campo</SelectItem>
                                        <SelectItem value="hide">Ocultar campo</SelectItem>
                                        <SelectItem value="show">Mostrar campo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Label className="text-xs">El campo:</Label>
                                <Select
                                    value={rule.targetFieldId}
                                    onValueChange={(value) => updateConditionalRule(rule.id, 'targetFieldId', value)}
                                >
                                    <SelectTrigger className="w-full text-sm">
                                        <SelectValue placeholder="Selecciona un campo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targetableComponents.length === 0 && (
                                            <SelectItem value="" disabled>No hay otros campos</SelectItem>
                                        )}
                                        {targetableComponents.map((targetComp) => (
                                            <SelectItem key={targetComp.id} value={targetComp.id}>
                                                {targetComp.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>
                    ))}
                    <Button onClick={addConditionalRule} variant="secondary" className="w-full mt-4 flex items-center gap-2"  disabled={targetableComponents.length === 0}>
                        <PlusIcon className="h-4 w-4" /> Añadir Regla Condicional
                    </Button>
                </TabsContent>
                {/* --- FIN NUEVA PESTAÑA --- */}
            </Tabs>
            <Button onClick={onClose} className="mt-6 w-full" variant="outline">
                Cerrar Panel
            </Button>
        </div>
    )
}

// Canvas del diseñador (sin cambios relevantes para este tema)
const FormDesignerCanvas: React.FC<{
    components: FormComponent[]
    selectedComponent: FormComponent | null
    setComponents: React.Dispatch<React.SetStateAction<FormComponent[]>>
    setSelectedComponent: React.Dispatch<React.SetStateAction<FormComponent | null>>
    moveComponent: (dragIndex: number, hoverIndex: number) => void
    deleteComponent: (id: string) => void
}> = ({ components, selectedComponent, setComponents, setSelectedComponent, moveComponent, deleteComponent }) => {
    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: [ItemTypes.PALETTE_ITEM],
            drop: (item: { type: string; defaultProps?: any; defaultValidation?: any; options?: any[] }, monitor) => {
                if (monitor.didDrop()) return

                const newComponent: FormComponent = {
                    id: uuidv4(),
                    type: item.type as ComponentType,
                    props: item.defaultProps || {},
                    validation: item.defaultValidation || {},
                    options: item.options || [],
                    ...(item.type === "section" ? { children: [] } : {}),
                    conditionalRules: [], // Inicializar reglas condicionales
                }

                setComponents((prev) => [...prev, newComponent])
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
                canDrop: monitor.canDrop(),
            }),
        }),
        [setComponents],
    )

    return (
        <div
            ref={drop}
            className={`flex-1 p-6 relative min-h-[600px] ${isOver && canDrop ? "bg-secondary/20" : "bg-background"}`}
        >
            {components.length === 0 && !isOver && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-center">
                    Arrastra y suelta componentes aquí
                </div>
            )}
            {components.map((comp, index) => (
                <FormField
                    key={comp.id}
                    component={comp}
                    index={index}
                    moveComponent={moveComponent}
                    onSelect={setSelectedComponent}
                    onDelete={deleteComponent}
                    selectedComponentId={selectedComponent?.id || null}
                />
            ))}
        </div>
    )
}

// Componente principal FormDesigner
interface FormDesignerProps {
    initialFormStructure: FormComponent[]
    onFormStructureChange: (structure: FormComponent[]) => void
    onSaveFormStructure?: (structure: FormComponent[]) => Promise<void>
    autoSaveInterval?: number
    isSaving?: boolean;
    lastSavedTime?: Date | null;
}

const FormDesigner: React.FC<FormDesignerProps> = ({
    initialFormStructure,
    onFormStructureChange,
    onSaveFormStructure,
    autoSaveInterval = 60000,
    isSaving = false,
    lastSavedTime = null,
}) => {
    const [components, setComponents] = useState<FormComponent[]>(initialFormStructure)
    const [selectedComponent, setSelectedComponent] = useState<FormComponent | null>(null)
    const initialLoadRef = useRef(true);

    // Sincronizar con la estructura inicial solo cuando sea necesario
    useEffect(() => {
        if (JSON.stringify(initialFormStructure) !== JSON.stringify(components)) {
            setComponents(initialFormStructure);
            initialLoadRef.current = true;
        }
    }, [initialFormStructure]);


    // Propagar cambios hacia arriba (onFormStructureChange)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onFormStructureChange(components)
        }, 100)

        return () => clearTimeout(timeoutId)
    }, [components, onFormStructureChange])

    // Lógica de Auto-Guardado
    useEffect(() => {
        if (!onSaveFormStructure || initialLoadRef.current) {
            initialLoadRef.current = false;
            return;
        }

        const handler = setTimeout(async () => {
            console.log("Auto-guardando estructura del formulario...", components);
            await onSaveFormStructure(components);
        }, autoSaveInterval);

        return () => {
            clearTimeout(handler);
        };
    }, [components, onSaveFormStructure, autoSaveInterval]);


    const componentPalette: ComponentPaletteItem[] = [
        {
            type: "text",
            label: "Campo de Texto",
            defaultProps: { label: "Nuevo Campo de Texto", placeholder: "" },
            icon: <TypeIcon className="w-4 h-4" />,
        },
        {
            type: "textarea",
            label: "Área de Texto",
            defaultProps: { label: "Nueva Área de Texto", placeholder: "", rows: 3 },
            icon: <TextIcon className="w-4 h-4" />,
        },
        {
            type: "number",
            label: "Campo de Número",
            defaultProps: { label: "Nuevo Campo Numérico", placeholder: "" },
            icon: <ListOrderedIcon className="w-4 h-4" />,
        },
        {
            type: "email",
            label: "Email",
            defaultProps: { label: "Correo Electrónico", placeholder: "ejemplo@dominio.com" },
            icon: <MailIcon className="w-4 h-4" />,
        },
        {
            type: "phone",
            label: "Teléfono",
            defaultProps: { label: "Número de Teléfono", placeholder: "" },
            icon: <PhoneIcon className="w-4 h-4" />,
        },
        {
            type: "date",
            label: "Fecha",
            defaultProps: { label: "Selector de Fecha" },
            icon: <CalendarIcon className="w-4 h-4" />,
        },
        {
            type: "time",
            label: "Hora",
            defaultProps: { label: "Selector de Hora" },
            icon: <ClockIcon className="w-4 h-4" />,
        },
        {
            type: "datetime",
            label: "Fecha y Hora",
            defaultProps: { label: "Selector de Fecha y Hora" },
            icon: <CalendarClockIcon className="w-4 h-4" />,
        },
        {
            type: "select",
            label: "Selector (Dropdown)",
            defaultProps: { label: "Nuevo Selector" },
            options: [
                // ¡IMPORTANTE! NINGÚN value DEBE SER ""
            // { value: '', label: 'Por favor, selecciona' }, // <-- SI TIENES ESTO, ES EL PROBLEMA
            { value: 'opcion1', label: 'Opción 1' },
            { value: 'opcion2', label: 'Opción 2' },
            // Si quieres una opción de "limpiar", podrías usar algo como:
            // { value: 'clear_selection', label: 'Limpiar selección' },
            ],
            icon: <ArrowDownNarrowWideIcon className="w-4 h-4" />,
        },
         // ######################################################################################################
        // ACTUALIZADO: Componente Select (ahora puede tener opciones manuales o de BD)
        {
            type: 'select_dinamico',
            label: 'Lista Desplegable',
            icon: <ListOrderedIcon className="h-4 w-4" />,
            defaultProps: { label: 'Nueva Lista Desplegable', placeholder: 'Seleccione una opción' },
            options: [// ¡IMPORTANTE! NINGÚN value DEBE SER ""
            // { value: '', label: 'Por favor, selecciona' }, // <-- SI TIENES ESTO, ES EL PROBLEMA
            { value: 'opcion1', label: 'Opción 1' },
            { value: 'opcion2', label: 'Opción 2' },],
            // Si quieres una opción de "limpiar", podrías usar algo como:
            // { value: 'clear_selection', label: 'Limpiar selección' },], // Opciones por defecto si no se usa BD
            defaultValidation: { required: false },
            // NO se pone entityName aquí, se configura en el panel de propiedades
        },
        // ######################################################################################################

        {
            type: "checklist",
            label: "Checklist",
            defaultProps: { label: "Nueva Checklist" },
            options: [{ value: "op1", label: "Opción 1" }],
            icon: <ListChecksIcon className="w-4 h-4" />,
        },
        {
            type: "radio",
            label: "Grupo de Radio",
            defaultProps: { label: "Nuevo Grupo Radio" },
            options: [{ value: "op1", label: "Opción 1" }],
            icon: <CircleDotIcon className="w-4 h-4" />,
        },
        {
            type: "checkbox",
            label: "Checkbox Individual",
            defaultProps: { label: "Nuevo Checkbox", defaultChecked: false },
            icon: <SquareIcon className="w-4 h-4" />,
        },
        {
            type: "signature",
            label: "Firma",
            defaultProps: { label: "Campo de Firma" },
            icon: <SignatureIcon className="w-4 h-4" />,
        },
        {
            type: "qr_scanner",
            label: "Escaner QR",
            defaultProps: { label: "Escaner Código QR" },
            icon: <QrCodeIcon className="w-4 h-4" />,
        },
        { type: "photo", label: "Foto", defaultProps: { label: "Tomar Foto" }, icon: <CameraIcon className="w-4 h-4" /> },
        {
            type: "file",
            label: "Subir Archivo",
            defaultProps: { label: "Subir Archivo" },
            icon: <FileIcon className="w-4 h-4" />,
        },
        {
            type: "section",
            label: "Sección/Área",
            defaultProps: { title: "Nueva Sección", description: "" },
            icon: <SquareDotIcon className="w-4 h-4" />,
        },
        {
            type: "static_text",
            label: "Texto Estático",
            defaultProps: { content: "Bloque de texto informativo." },
            icon: <HeadingIcon className="w-4 h-4" />,
        },
        { type: "divider", label: "Divisor", defaultProps: {}, icon: <MinusIcon className="w-4 h-4" /> },
    ]
 const addComponent = useCallback((item: ComponentPaletteItem) => {
        const newComponent: FormComponent = {
            id: uuidv4(),
            type: item.type as ComponentType,
            props: { ...item.defaultProps },
            validation: { ...item.defaultValidation },
            // ######################################################################################################
            // Si el componente tiene opciones por defecto, las asignamos.
            // Si es un 'select' y no tiene opciones, entityName se definirá en el panel de propiedades.
            options: item.options ? [...item.options] : undefined,
            entityName: undefined, // Inicialmente undefined para el nuevo campo
            // ######################################################################################################
            children: item.type === 'section' ? [] : undefined,
        };
        setComponents((prev) => [...prev, newComponent]);
        setSelectedComponent(newComponent); // Seleccionar el componente recién añadido
    }, []);

    const findComponent = useCallback(
        (id: string, currentComponents: FormComponent[]): { component: FormComponent | null; path: number[] | null } => {
            for (let i = 0; i < currentComponents.length; i++) {
                const comp = currentComponents[i]
                if (comp.id === id) {
                    return { component: comp, path: [i] }
                }
                if (comp.children && comp.children.length > 0) {
                    const foundInChild = findComponent(id, comp.children)
                    if (foundInChild.component) {
                        return { component: foundInChild.component, path: [i, ...(foundInChild.path || [])] }
                    }
                }
            }
            return { component: null, path: null }
        },
        [],
    )

    const updateComponentProps = useCallback(
        (id: string, newProps: Partial<FormComponent>) => {
            setComponents((prevComponents) => {
                const newStructure = [...prevComponents]
                const { component: compToUpdate, path } = findComponent(id, newStructure)

                if (compToUpdate && path) {
                    let target: FormComponent[] = newStructure
                    for (let i = 0; i < path.length - 1; i++) {
                        target = target[path[i]].children ? [...target[path[i]].children] : []
                        newStructure[path[i]] = { ...newStructure[path[i]], children: target }
                    }
                    const lastIndex = path[path.length - 1]
                    const updatedComp = {
                        ...target[lastIndex],
                        ...newProps,
                        props: { ...target[lastIndex].props, ...(newProps.props || {}) },
                        validation: { ...target[lastIndex].validation, ...(newProps.validation || {}) },
                        options: newProps.options || target[lastIndex].options,
                        conditionalRules: newProps.conditionalRules || target[lastIndex].conditionalRules, // Actualizar reglas condicionales
                    }
                    target[lastIndex] = updatedComp

                    if (selectedComponent && selectedComponent.id === id) {
                        setSelectedComponent(updatedComp)
                    }

                    return newStructure
                }
                return prevComponents
            })
        },
        [findComponent, selectedComponent],
    )

    const deleteComponent = useCallback(
        (id: string) => {
            setComponents((prevComponents) => {
                const newStructure = prevComponents.filter((comp) => comp.id !== id)
                if (selectedComponent && selectedComponent.id === id) {
                    setSelectedComponent(null)
                }
                return newStructure
            })
        },
        [selectedComponent],
    )

    const moveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
        setComponents((prevComponents) => {
            const newComponents = [...prevComponents]
            const [draggedItem] = newComponents.splice(dragIndex, 1)
            newComponents.splice(hoverIndex, 0, draggedItem)
            return newComponents
        })
    }, [])

    return (
        <div className="flex border rounded-lg overflow-hidden min-h-[600px]">
            {/* Panel de Componentes (Palette) */}
            <Card className="w-64 p-4 border-r rounded-none bg-card text-card-foreground">
                <CardTitle className="text-md font-semibold mb-4">Componentes</CardTitle>
                <div className="grid grid-cols-1 gap-2">
                    {componentPalette.map((item) => (
                        <DraggablePaletteItem key={item.type} item={item} />
                    ))}
                </div>
            </Card>

            {/* Área de Diseño (Canvas) */}
            <FormDesignerCanvas
                components={components}
                selectedComponent={selectedComponent}
                setComponents={setComponents}
                setSelectedComponent={setSelectedComponent}
                moveComponent={moveComponent}
                deleteComponent={deleteComponent}
            />

            {/* Panel de Propiedades */}
            {selectedComponent && (
                <PropertiesPanel
                    component={selectedComponent}
                    onUpdate={updateComponentProps}
                    onClose={() => setSelectedComponent(null)}
                    allComponents={components}
                />
            )}
        </div>
    )
}

export default FormDesigner
