"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, BookMarked } from "lucide-react"
import { useRituals } from "@/hooks/use-rituals"
import { useUsers } from "@/hooks/use-users"
import { useEffect, useState } from "react"

export function DashboardStats() {
  const { rituals } = useRituals()
  const { users } = useUsers()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simular un tiempo de carga para dar tiempo a que se carguen los datos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Manejar errores
  useEffect(() => {
    if (!isLoading && (!rituals || !users)) {
      setError("Error al cargar los datos. Por favor, recarga la página.")
    } else {
      setError(null)
    }
  }, [isLoading, rituals, users])

  const totalRituals = rituals?.length || 0
  const totalUsers = users?.length || 0

  // Contar rituales por grado
  const ritualsByDegree =
    rituals?.reduce(
      (acc, ritual) => {
        acc[ritual.degree] = (acc[ritual.degree] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    ) || {}

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Rituales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-6 w-16 animate-pulse bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-6 w-16 animate-pulse bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rituales por Grado</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse bg-muted rounded"></div>
              <div className="h-4 w-full animate-pulse bg-muted rounded"></div>
              <div className="h-4 w-full animate-pulse bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Rituales</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRituals}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rituales por Grado</CardTitle>
          <BookMarked className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Grado 1:</span>
              <span className="font-medium">{ritualsByDegree[1] || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Grado 2:</span>
              <span className="font-medium">{ritualsByDegree[2] || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Grado 3:</span>
              <span className="font-medium">{ritualsByDegree[3] || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
