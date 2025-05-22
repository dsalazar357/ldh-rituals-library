"use client"

import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useRituals } from "@/hooks/use-rituals"
import { useAuth } from "@/hooks/use-auth"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

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
  const { rituals } = useRituals()
  const { user } = useAuth()

  // Filtrar rituales por grado del usuario
  const accessibleRituals = rituals.filter((ritual) => ritual.degree <= (user?.degree || 0))

  return (
    <div className="flex items-center justify-between">
      <DashboardHeader
        title="Rituales"
        description={`${accessibleRituals.length} rituales disponibles para tu grado`}
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
