"use client"

import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useRituals } from "@/hooks/use-rituals"
import { useAuth } from "@/hooks/use-auth"

export function RitualsHeader() {
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
