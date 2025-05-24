"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, BookMarked, FileIcon, Eye, LogOut } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string
  role: string
  degree: number
}

interface Ritual {
  id: string
  name: string
  degree: number
  ritualSystem: string
  createdAt: string
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadData = async () => {
      try {
        // Cargar datos del usuario actual
        const userResponse = await fetch("/api/debug")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }

        // Cargar rituales
        const ritualsResponse = await fetch("/api/rituals")
        if (ritualsResponse.ok) {
          const ritualsData = await ritualsResponse.json()
          setRituals(ritualsData.rituals || [])
        }

        // Cargar usuarios (solo para admins)
        const usersResponse = await fetch("/api/users")
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [mounted])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Filtrar rituales por grado del usuario
  const accessibleRituals = rituals.filter((ritual) => ritual.degree <= (user?.degree || 0))
  const recentRituals = [...accessibleRituals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Contar rituales por grado
  const ritualsByDegree = rituals.reduce(
    (acc, ritual) => {
      acc[ritual.degree] = (acc[ritual.degree] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">Bienvenido a la Biblioteca de Rituales de Le Droit Humain</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Rituales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : rituals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : users.length}</div>
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

      {/* Recent Rituals */}
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
            {loading ? (
              <div className="text-center py-4">Cargando rituales...</div>
            ) : recentRituals.length > 0 ? (
              recentRituals.map((ritual) => (
                <div key={ritual.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{ritual.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Grado {ritual.degree} • {ritual.ritualSystem} •{" "}
                        {new Date(ritual.createdAt).toLocaleDateString("es-ES")}
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

      {/* Debug Tools */}
      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-4">Herramientas de depuración</h3>
        <div className="space-y-4">
          {user && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Usuario actual:</h4>
              <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
            </div>
          )}
          <div className="flex gap-2">
            <Link href="/admin-check">
              <Button variant="outline" size="sm">
                Verificar Admin
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
