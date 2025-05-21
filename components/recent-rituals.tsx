"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileIcon, Eye } from "lucide-react"
import Link from "next/link"
import { useRituals } from "@/hooks/use-rituals"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

export function RecentRituals() {
  const { rituals } = useRituals()
  const { user } = useAuth()

  // Filtrar rituales por grado del usuario
  const accessibleRituals = rituals.filter((ritual) => ritual.degree <= (user?.degree || 0))

  // Ordenar por fecha de creación y tomar los 5 más recientes
  const recentRituals = [...accessibleRituals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rituales Recientes</CardTitle>
        <Link href="/rituales">
          <Button variant="outline" size="sm">
            Ver Todos
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentRituals.length > 0 ? (
            recentRituals.map((ritual) => (
              <div key={ritual.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{ritual.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Grado {ritual.degree} • {ritual.ritualSystem} • {formatDate(ritual.createdAt)}
                    </p>
                  </div>
                </div>
                <Link href={`/rituales/${ritual.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver ritual</span>
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No hay rituales disponibles para tu grado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
