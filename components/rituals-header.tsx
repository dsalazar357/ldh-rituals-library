"use client"

import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRituals } from "@/hooks/use-rituals"
import { useAuth } from "@/hooks/use-auth"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Componente de carga para el encabezado
function RitualsHeaderLoading() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

// Componente principal del encabezado
function RitualsHeaderContent() {
  const { rituals, error, isLoading } = useRituals()
  const { user } = useAuth()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Error al cargar los rituales: {error.message}</AlertDescription>
      </Alert>
    )
  }

  // Asegurarse de que rituals es un array
  const ritualsArray = Array.isArray(rituals) ? rituals : []

  // Filtrar rituales por grado del usuario
  const accessibleRituals = ritualsArray.filter((ritual) => ritual.degree <= (user?.degree || 0))

  return (
    <div className="flex items-center justify-between">
      <DashboardHeader
        title="Rituales"
        description={
          isLoading ? "Cargando rituales..." : `${accessibleRituals.length} rituales disponibles para tu grado`
        }
      />
      <Link href="/rituales/nuevo">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ritual
        </Button>
      </Link>
    </div>
  )
}

// Componente exportado que envuelve el contenido en Suspense
export function RitualsHeader() {
  return (
    <Suspense fallback={<RitualsHeaderLoading />}>
      <RitualsHeaderContent />
    </Suspense>
  )
}
