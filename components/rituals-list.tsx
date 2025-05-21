"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileIcon } from "lucide-react"
import Link from "next/link"
import { useRituals } from "@/hooks/use-rituals"
import { useRitualsFilter } from "@/hooks/use-rituals-filter"
import { useAuth } from "@/hooks/use-auth"
import { formatDate } from "@/lib/utils"

export function RitualsList() {
  const { rituals } = useRituals()
  const { filters } = useRitualsFilter()
  const { user } = useAuth()

  // Filtrar rituales por grado del usuario y filtros aplicados
  let filteredRituals = rituals.filter((ritual) => ritual.degree <= (user?.degree || 0))

  // Aplicar filtros adicionales
  if (filters.degree) {
    filteredRituals = filteredRituals.filter((ritual) => ritual.degree === filters.degree)
  }

  if (filters.ritualSystem) {
    filteredRituals = filteredRituals.filter((ritual) => ritual.ritualSystem === filters.ritualSystem)
  }

  if (filters.language) {
    filteredRituals = filteredRituals.filter((ritual) => ritual.language === filters.language)
  }

  // Organizar por el criterio seleccionado
  const organizedRituals: Record<string, typeof filteredRituals> = {}

  filteredRituals.forEach((ritual) => {
    let key = ""

    switch (filters.organizeBy) {
      case "degree":
        key = `Grado ${ritual.degree}`
        break
      case "ritualSystem":
        key = ritual.ritualSystem
        break
      case "language":
        key = ritual.language
        break
      default:
        key = `Grado ${ritual.degree}`
    }

    if (!organizedRituals[key]) {
      organizedRituals[key] = []
    }

    organizedRituals[key].push(ritual)
  })

  return (
    <div className="space-y-6">
      {Object.keys(organizedRituals).length > 0 ? (
        Object.entries(organizedRituals).map(([category, rituals]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold">{category}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {rituals.map((ritual) => (
                <Card key={ritual.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted rounded-lg p-2">
                      <FileIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{ritual.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {ritual.ritualSystem} • {ritual.language}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Subido por {ritual.author} • {formatDate(ritual.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/rituales/${ritual.id}`}>
                        <Button variant="ghost" size="icon" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Descargar"
                        onClick={() => window.open(ritual.fileUrl, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Descargar</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron rituales con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  )
}
