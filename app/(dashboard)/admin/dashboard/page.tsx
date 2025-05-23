"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Settings, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Solo verificar después de que el componente esté montado y la autenticación haya cargado
    if (mounted && !isLoading) {
      // Si no hay usuario o no es admin, redirigir al dashboard
      if (!user || user.role !== "admin") {
        console.log("No tienes permisos de administrador. Redirigiendo...")
        router.push("/")
      }
    }
  }, [user, isLoading, mounted, router])

  // Mostrar un estado de carga mientras se verifica
  if (isLoading || !mounted) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Cargando Panel de Administración"
          description="Verificando permisos de administrador..."
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Si no es admin pero aún no se ha redirigido, mostrar mensaje de error
  if (!user || user.role !== "admin") {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Acceso Denegado"
          description="No tienes permisos para acceder al panel de administración"
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            Esta área está restringida a usuarios con rol de administrador. Serás redirigido al panel principal.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")}>Volver al Panel Principal</Button>
      </div>
    )
  }

  // Si es admin, mostrar el panel de administración
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Panel de Administración"
        description="Gestiona usuarios, rituales y configuraciones del sistema"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestión de Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Administra usuarios, asigna roles y gestiona permisos.
            </div>
            <Link href="/admin/usuarios">
              <Button className="w-full">Administrar Usuarios</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestión de Rituales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Revisa, aprueba y gestiona todos los rituales del sistema.
            </div>
            <Link href="/rituales">
              <Button className="w-full">Administrar Rituales</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuración del Sistema</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Configura parámetros del sistema y opciones avanzadas.
            </div>
            <Button className="w-full" variant="outline">
              Configuración
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
            Área de Administración
          </CardTitle>
          <CardDescription>
            Esta área está restringida a usuarios con rol de administrador. Todas las acciones realizadas aquí quedan
            registradas en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Como administrador, tienes acceso completo a todas las funcionalidades del sistema. Recuerda que con grandes
            poderes vienen grandes responsabilidades.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
