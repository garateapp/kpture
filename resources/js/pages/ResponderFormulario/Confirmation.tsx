// resources/js/pages/ResponderFormulario/Confirmation.tsx

import type React from "react"
import { Head } from "@inertiajs/react"
import type { PageProps } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { Link, usePage ,router} from "@inertiajs/react"

interface ConfirmationProps extends PageProps {
  message: string
}

const Confirmation: React.FC<ConfirmationProps> = ({ message }) => {
  const { route } = usePage().props

  return (
    <AppLayout>
      <Head title="Formulario Enviado" />

      <div className="py-12">
        <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-center text-2xl">¡Formulario Enviado Correctamente!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg mb-6">{message}</p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                <Button asChild variant="outline">
                  <Link href="/formularios/responder">Responder otro formulario</Link>
                </Button>

                <Button asChild>
                  <Link href="/formularios/mis-respuestas">Ver mis respuestas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default Confirmation
